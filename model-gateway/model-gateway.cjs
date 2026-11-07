'use strict';
// Local model gateway: the endpoint and credentials are supplied by the operator.
const fs = require('node:fs');
const path = require('node:path');
const http = require('node:http');
const crypto = require('node:crypto');
const { app, ipcMain, safeStorage, net } = require('electron');
const { normalizeUrl, discover, capability, PROTOCOLS } = require('./provider-discovery.cjs');
const { requestFor, relayAnthropic } = require('./provider-protocol.cjs');
const root = path.resolve(process.resourcesPath, '..', '..');
const runtime = path.join(root, 'data', 'runtime');
const configPath = path.join(runtime, 'model-provider.json');
fs.mkdirSync(runtime, { recursive: true });
app.setPath('userData', path.join(root, 'data', 'chromium'));
process.env.PLC_CODE_RUNTIME_HOME = runtime;
const localToken = crypto.randomBytes(32).toString('hex');
let base = '', config = null;
function normalize(input) {
  return normalizeUrl(input);
}
function endpoint(baseUrl, suffix) { return normalize(baseUrl) + '/' + suffix; }
function modelId(key) { return String(key || '').replace(/^openai\//, ''); }
function validate(input, previous = {}, requireModel = true) {
  const sameService = previous.baseUrl && normalize(input.baseUrl) === previous.baseUrl;
  if (!sameService && !input.apiKey && previous.apiKey && !input.clearKey) throw new Error('更换服务地址时请重新填写该服务的 API Key，或勾选无需密钥。');
  const result = {
    name: String(input.name || '自备模型').trim().slice(0, 80),
    baseUrl: normalize(input.baseUrl),
    defaultModel: String(input.defaultModel || '').trim(),
    models: [...new Set((input.models || []).map(x => String(x).trim()).filter(Boolean))],
    maxTokens: Math.max(256, Math.min(131072, Number(input.maxTokens) || 8192)),
    apiKey: input.clearKey ? '' : String(input.apiKey || (sameService ? previous.apiKey : '') || '').trim(),
    metadata: input.metadata || (sameService ? previous.metadata : {}) || {},
    protocol: PROTOCOLS.includes(input.protocol) ? input.protocol : previous.protocol || 'auto',
    authProtocol: ['openai', 'anthropic'].includes(input.authProtocol) ? input.authProtocol : undefined,
    detection: input.detection || (sameService ? previous.detection : undefined),
  };
  if (requireModel && !result.defaultModel) throw new Error('请先一键识别模型，或在高级设置中填写默认模型 ID。');
  if (requireModel && result.protocol === 'auto') result.protocol = 'openai';
  if (/[\r\n\0]/.test(result.apiKey)) throw new Error('API Key 中不能包含换行。');
  if (result.apiKey.length > 8192) throw new Error('API Key 长度异常。');
  if (result.defaultModel && !result.models.includes(result.defaultModel)) result.models.unshift(result.defaultModel);
  if (result.models.length > 2000) throw new Error('模型数量过多，请保留需要的模型。');
  const catalog = JSON.parse(fs.readFileSync(path.join(__dirname, 'model-catalog.json'), 'utf8'));
  result.metadata = Object.fromEntries(result.models.map(id => [id, result.metadata[id] || capability({id},catalog[id],result.protocol)]));
  return result;
}
function load() {
  if (config) return config;
  let stored = {};
  if (fs.existsSync(configPath)) stored = JSON.parse(fs.readFileSync(configPath, 'utf8'));
  if (stored.keyProtected) {
    if (!safeStorage.isEncryptionAvailable()) throw new Error('系统密钥加密不可用，无法读取已保存的 API Key。');
    stored.apiKey = safeStorage.decryptString(Buffer.from(stored.keyProtected, 'base64'));
  }
  const catalogFile = path.join(__dirname, 'model-catalog.json');
  const catalog = fs.existsSync(catalogFile) ? JSON.parse(fs.readFileSync(catalogFile, 'utf8')) : {};
  const metadataFile = path.join(runtime, 'model-metadata.json');
  const localMetadata = fs.existsSync(metadataFile) ? JSON.parse(fs.readFileSync(metadataFile, 'utf8')) : {};
  const savedMetadata = stored.metadata || {};
  stored.metadata = Object.fromEntries([...new Set([...Object.keys(catalog), ...Object.keys(localMetadata), ...Object.keys(savedMetadata)])]
    .map(id => [id, { ...catalog[id], ...localMetadata[id], ...savedMetadata[id] }]));
  config = { name: '自备模型', baseUrl: '', defaultModel: '', models: [], maxTokens: 8192, apiKey: '', protocol: 'auto', ...stored };
  return config;
}
function publicConfig(value = load()) {
  const { apiKey, keyProtected, ...publicValue } = value;
  return { ...publicValue, needsSetup: !value.baseUrl || !value.defaultModel, hasKey: Boolean(apiKey), apiKey: '' };
}
function persist(value) {
  const disk = { ...value };
  delete disk.apiKey;
  if (value.apiKey) {
    if (!safeStorage.isEncryptionAvailable()) throw new Error('系统密钥加密不可用，本次没有保存。');
    disk.keyProtected = safeStorage.encryptString(value.apiKey).toString('base64');
  }
  const temporary = configPath + '.tmp';
  fs.writeFileSync(temporary, JSON.stringify(disk, null, 2), { mode: 0o600 });
  fs.renameSync(temporary, configPath);
  config = value;
}
function models() {
  const current = load();
  return current.models.map(id => {
    const known = current.metadata?.[id] || {};
    return { key: 'openai/' + id, label: known.label || known.name || id, enabled: true,
      vision: Boolean(known.vision), multiplier: 1,
      contextLength: Number(known.contextLength) || 128000, isDefault: id === current.defaultModel,
      ...(known.supportsReasoningEffort ? {supportsReasoningEffort:true,reasoningEfforts:known.discovery?.status === 'catalog' || !known.discovery ? {low:'low',medium:'medium',high:'high',max:'max'} : known.reasoningEfforts,
        thinkingKind:known.thinkingKind,thinkingFields:known.thinkingFields} : {}) };
  });
}
function localState() {
  // Legacy shell uses this boolean as a workspace gate. It represents local readiness,
  // not a person, login, subscription or vendor authorization. Never saved to account.json.
  return { isLoggedIn: true, serverUrl: base, token: localToken, phone: '', name: '自备模型',
    tokenBalance: 0, balance: 0, usageTokens: 0, usageRequests: 0, usageAmount: 0,
    rechargeTotal: 0, exchangedTokens: 0, billing: null, subscription: null,
    subscriptionPlans: [], usageDays: [], createdAt: '', lastLoginAt: '' };
}
function headers(value) {
  return { 'Content-Type': 'application/json', ...(value.apiKey ? { Authorization: 'Bearer ' + value.apiKey } : {}) };
}
function message(response, status, object) {
  response.writeHead(status, { 'Content-Type': 'application/json; charset=utf-8' });
  response.end(JSON.stringify(object));
}
async function readBody(request) {
  const chunks = []; let size = 0;
  for await (const chunk of request) {
    size += chunk.length;
    if (size > 32 * 1024 * 1024) throw new Error('请求超过 32 MB。');
    chunks.push(chunk);
  }
  return JSON.parse(Buffer.concat(chunks).toString('utf8') || '{}');
}
const server = http.createServer(async (request, response) => {
  if (request.headers.authorization !== 'Bearer ' + localToken)
    return message(response, 401, { error: { message: 'Unauthorized local client' } });
  const route = new URL(request.url, 'http://127.0.0.1').pathname;
  try {
    if (request.method === 'GET' && ['/v1/models', '/api/models'].includes(route))
      return message(response, 200, { models: models(), data: models().map(m => ({ id: modelId(m.key), object: 'model' })) });
    if (request.method !== 'POST' || route !== '/v1/chat/completions')
      return message(response, 404, { error: { message: 'This build supports OpenAI-compatible chat completions only.' } });
    const current = load();
    if (!current.baseUrl || !current.defaultModel) return message(response, 400, { error: { message: '请先在自备模型中配置服务地址和默认模型。' } });
    const body = await readBody(request);
    body.model = modelId(body.model || current.defaultModel);
    // The closed engine also requests a built-in title model. Route that helper
    // through the user's selected default rather than an unavailable vendor slot.
    if (!current.models.includes(body.model)) body.model = current.defaultModel;
    if (body.max_tokens) body.max_tokens = Math.min(body.max_tokens, current.maxTokens);
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 180000);
    response.on('close', () => controller.abort());
    try {
      let effort = 'auto';
      try { effort = JSON.parse(fs.readFileSync(path.join(runtime, 'settings.json'), 'utf8')).reasoningEffort || 'auto'; } catch {}
      const outgoing = requestFor(current, body, effort);
      const upstream = await net.fetch(outgoing.url, {
        method: 'POST', headers: outgoing.headers, body: JSON.stringify(outgoing.body),
        signal: controller.signal, redirect: 'error',
      });
      if (upstream.ok && current.protocol === 'anthropic') return await relayAnthropic(upstream, response, body.model, body.stream);
      response.writeHead(upstream.status, { 'Content-Type': upstream.headers.get('content-type') || 'application/json',
        'Cache-Control': 'no-cache' });
      if (upstream.body) {
        const reader = upstream.body.getReader();
        while (true) {
          const { value, done } = await reader.read();
          if (done) break;
          if (!response.write(Buffer.from(value))) await new Promise(resolve => response.once('drain', resolve));
        }
      }
      response.end();
    } finally { clearTimeout(timeout); }
  } catch (error) {
    if (!response.headersSent) message(response, 502, { error: { message: '模型请求失败，请检查服务地址、密钥和网络。' } });
    else response.destroy();
  }
});
const ready = new Promise((resolve, reject) => {
  server.once('error', reject);
  server.listen(0, '127.0.0.1', () => { base = 'http://127.0.0.1:' + server.address().port; resolve(); });
});
app.once('will-quit', () => server.close());
function trusted(event) {
  const url = event.senderFrame?.url || '';
  // 原版只认 `file:.../app.asar/out/renderer/index.html`（打包后路径）。
  // 开发模式下渲染进程从 out/renderer/index.html 直接加载，这里同时接受两种形态，
  // 仍然限制为本地 file: 协议 + 渲染进程主文档，不接受 http(s)/远程帧。
  const packaged = url.startsWith('file:') && url.includes('/app.asar/out/renderer/index.html');
  const devBuild = url.startsWith('file:') && /\/out\/renderer\/index\.html/.test(url);
  if (!packaged && !devBuild) throw new Error('不受信任的设置窗口。');
}
async function testConnection(input) {
  const value = validate(input, load(), false);
  const catalog = JSON.parse(fs.readFileSync(path.join(__dirname, 'model-catalog.json'), 'utf8'));
  try { return await discover(value, { fetcher: (...args) => net.fetch(...args), catalog }); }
  catch (error) { throw new Error(String(error.message || '连接失败').split(value.apiKey || '\u0000').join(value.apiKey ? '[已隐藏]' : '')); }
}
function register(callbacks) {
  for (const [channel, handler] of Object.entries({
    'model:get': () => publicConfig(),
    'model:test': input => testConnection(input),
    'model:save': input => {
      if (callbacks.busy()) throw new Error('当前有任务正在运行，请等待任务结束后再保存。');
      const value = validate(input, load());
      persist(value);
      callbacks.changed(models(), value.defaultModel);
      return publicConfig();
    },
  })) ipcMain.handle(channel, async (event, input) => { trusted(event); return handler(input); });
  for (const channel of ['account:login', 'account:logout', 'account:rechargeQr', 'account:subscriptionQr',
    'account:subscriptionActivate', 'account:orderStatus', 'account:submitFeedback', 'account:listFeedback']) {
    ipcMain.removeHandler(channel);
    ipcMain.handle(channel, () => ({ ok: false, error: '此副本使用自备模型，不提供账户、订阅或充值服务。' }));
  }
}
async function initialize() {
  const seed = path.join(runtime, 'model-provider.seed.json');
  if (!fs.existsSync(configPath) && fs.existsSync(seed)) {
    persist(validate(JSON.parse(fs.readFileSync(seed, 'utf8'))));
    fs.unlinkSync(seed);
  }
  load();
}
module.exports = { ready, initialize, register, localState, models, publicConfig, validate, testConnection, runtime };
