'use strict';
// Discovery uses metadata endpoints only, never a paid inference probe.
const PROTOCOLS = ['auto', 'openai', 'anthropic', 'ollama'];
function normalizeUrl(input) {
  let url;
  try { url = new URL(String(input || '').trim()); } catch { throw new Error('请输入完整的 http 或 https 请求网址。'); }
  if (!['http:', 'https:'].includes(url.protocol) || url.username || url.password || url.search || url.hash)
    throw new Error('请求网址中不要包含密钥、查询参数或片段。');
  url.pathname = url.pathname.replace(/\/+$/, '').replace(/\/(?:chat\/completions|messages|models|responses)$/, '').replace(/\/api\/(?:tags|chat|show)$/, '');
  return url.href.replace(/\/+$/, '');
}
function authHeaders(key, protocol) {
  return { 'Content-Type': 'application/json', ...(protocol === 'anthropic'
    ? { 'anthropic-version': '2023-06-01', ...(key ? { 'x-api-key': key } : {}) }
    : key ? { Authorization: 'Bearer ' + key } : {}) };
}
function nativeEffort(value) {
  return ({ none: 'off', minimal: 'low', ultra: 'max' })[value] || value;
}
const accepted = ['off', 'low', 'medium', 'high', 'xhigh', 'max'];
function capability(raw, known = {}, protocol = 'openai') {
  const caps = raw.capabilities || {};
  const effort = caps.effort || caps.reasoning_effort;
  const source = raw.supported_reasoning_efforts || raw.reasoning_efforts || raw.reasoningEfforts || raw.reasoning?.efforts || raw.thinking?.values || raw.thinking?.levels;
  let values = Array.isArray(source) ? source : source && typeof source === 'object' ? Object.values(source) : [];
  if (!values.length && effort && typeof effort === 'object') values = Object.keys(effort).filter(key => key !== 'supported' && (effort[key] === true || effort[key]?.supported === true));
  const booleanThinking = protocol === 'ollama' && values.some(v=>typeof v==='boolean');
  values = [...new Set(values.filter(v => typeof v === 'string' || booleanThinking && typeof v === 'boolean').map(v => String(v).toLowerCase()))];
  const effortMap = {};
  for (const value of values) { const native = nativeEffort(value); if (accepted.includes(native) && (!effortMap[native] || native === value)) effortMap[native] = value; }
  if (booleanThinking) { if(values.includes('false'))effortMap.off='none';if(values.includes('true'))effortMap.high='high'; }
  const explicitUnsupported = effort?.supported === false && caps.thinking?.supported === false || raw.supportsReasoningEffort === false;
  const supportsThinking = caps.thinking?.supported === true || caps.includes?.('thinking') === true || raw.supportsReasoningEffort === true || raw.supported_parameters?.some(p => ['reasoning', 'reasoning_effort', 'thinking'].includes(p));
  const status = values.length ? 'reported' : explicitUnsupported ? 'unsupported' : supportsThinking ? 'levels_unknown' : known.supportsReasoningEffort ? 'catalog' : 'not_reported';
  const label = known.label || known.name || raw.display_name || raw.name || raw.label || raw.id || raw.model;
  const result = {
    label: String(label || '').slice(0, 240),
    contextLength: Number(raw.context_length || raw.context_window || raw.max_input_tokens || raw.top_provider?.context_length || known.contextLength) || 128000,
    contextSource: raw.context_length || raw.context_window || raw.max_input_tokens || raw.top_provider?.context_length ? 'reported' : known.contextLength ? 'catalog' : 'default',
    vision: raw.vision ?? caps.image_input?.supported ?? (Array.isArray(caps) ? caps.includes('vision') : known.vision) ?? false,
    maxOutputTokens: Number(raw.max_tokens || raw.top_provider?.max_completion_tokens) || undefined,
    discovery: { status, values, effortMap, protocol, booleanThinking, adaptive: caps.thinking?.types?.adaptive?.supported === true },
  };
  if (status === 'catalog') Object.assign(result, { supportsReasoningEffort: true, reasoningEfforts: { low:'low', medium:'medium', high:'high', max:'max' }, thinkingKind: known.thinkingKind, thinkingFields: known.thinkingFields });
  else if (Object.keys(effortMap).some(v => v !== 'off')) Object.assign(result, {
    supportsReasoningEffort: true,
    reasoningEfforts: Object.fromEntries(Object.keys(effortMap).map(v => [v, v])),
    thinkingKind: 'reasoning_effort',
  });
  else result.supportsReasoningEffort = false;
  return result;
}
async function jsonRequest(fetcher, url, key, protocol, signal, body) {
  const response = await fetcher(url, { method: body ? 'POST' : 'GET', headers: authHeaders(key, protocol), redirect: 'error', signal, ...(body ? { body: JSON.stringify(body) } : {}) });
  if (!response.ok) { const error = new Error('HTTP ' + response.status); error.status = response.status; throw error; }
  const length = Number(response.headers.get('content-length'));
  if (length > 8 * 1024 * 1024) throw new Error('模型列表过大。');
  const reader = response.body.getReader(); const parts = []; let size = 0;
  while (true) { const { value, done } = await reader.read(); if (done) break; size += value.length; if (size > 8 * 1024 * 1024) { await reader.cancel(); throw new Error('模型列表过大。'); } parts.push(Buffer.from(value)); }
  try { return JSON.parse(Buffer.concat(parts).toString('utf8')); } catch { throw new Error('接口没有返回 JSON 模型列表，请检查是否填写了网页地址。'); }
}
async function discover(input, { fetcher = fetch, catalog = {}, signal = AbortSignal.timeout(45000) } = {}) {
  const base = normalizeUrl(input.baseUrl), key = String(input.apiKey || '').trim();
  if (/[\r\n\0]/.test(key) || key.length > 8192) throw new Error('API Key 格式异常。');
  const requested = PROTOCOLS.includes(input.protocol) ? input.protocol : 'auto';
  const rawUrl = new URL(String(input.baseUrl).trim());
  const ollamaRoot = base.replace(/\/v1$/, '');
  let entries, protocol, discoveredBase, authProtocol, lastError;
  const likelyOllama = requested === 'ollama' || requested === 'auto' && (rawUrl.port === '11434' || /\/api\/(tags|chat|show)\/?$/.test(rawUrl.pathname));
  async function ollama() {
    const json = await jsonRequest(fetcher, ollamaRoot + '/api/tags', key, 'openai', signal);
    if (!Array.isArray(json.models)) throw new Error('接口没有返回 Ollama 模型列表。');
    entries = json.models.map(m => ({ ...m, id: m.model || m.name }));
    protocol = 'ollama'; discoveredBase = ollamaRoot + '/v1'; authProtocol = 'openai';
    // /api/show reads model information; it does not generate or load inference.
    let next = 0;
    await Promise.all(Array.from({ length: Math.min(4, entries.length) }, async () => {
      while (next < entries.length && next < 128) {
        const i = next++;
        try {
          const detail = await jsonRequest(fetcher, ollamaRoot + '/api/show', key, 'openai', signal, { model: entries[i].id });
          const context = Object.entries(detail.model_info || {}).find(([name]) => name.endsWith('.context_length'))?.[1];
          entries[i] = { ...entries[i], ...detail, id: entries[i].id, name: entries[i].name, context_length: context };
        } catch { /* Keep the ID and explicitly mark missing capabilities. */ }
      }
    }));
  }
  if (likelyOllama) { try { await ollama(); } catch (e) { lastError = e; if (requested === 'ollama') throw new Error('无法读取 Ollama 模型信息（' + e.message + '）。'); } }
  if (!entries) {
    const candidates = [...new Set([base, ...( /\/v\d+(?:beta)?$/.test(new URL(base).pathname) ? [] : [base + '/v1'] )])];
    outer: for (const candidate of candidates) {
      const hintsAnthropic = /\/messages\/?$/.test(rawUrl.pathname) || rawUrl.hostname === 'api.anthropic.com';
      const modes = requested === 'anthropic' ? ['anthropic'] : requested === 'openai' ? ['openai'] : hintsAnthropic ? ['anthropic', 'openai'] : ['openai', 'anthropic'];
      for (const mode of modes) {
        try {
          const json = await jsonRequest(fetcher, candidate + '/models', key, mode, signal);
          if (!Array.isArray(json.data)) throw new Error('接口没有返回可识别的模型列表。');
          const anthropicShape = json.data.some(m => m.type === 'model' && typeof m.display_name === 'string') && typeof json.has_more === 'boolean';
          protocol = requested !== 'auto' ? requested : anthropicShape || mode === 'anthropic' ? 'anthropic' : 'openai';
          authProtocol = mode; entries = json.data; discoveredBase = candidate;
          const seen = new Set();
          let cursor = json.last_id, more = json.has_more;
          while (protocol === 'anthropic' && more && cursor && entries.length < 2000 && !seen.has(cursor)) {
            seen.add(cursor);
            const page = await jsonRequest(fetcher, candidate + '/models?limit=1000&after_id=' + encodeURIComponent(cursor), key, mode, signal);
            if (!Array.isArray(page.data)) throw new Error('后续模型列表格式异常，请重试。');
            entries.push(...page.data); more = page.has_more; cursor = page.last_id;
          }
          break outer;
        } catch (e) { lastError = e; if (e.status === 429) throw new Error('服务请求过于频繁，请稍后重试。'); }
      }
    }
  }
  if (!entries && requested === 'auto') { try { await ollama(); } catch (e) { lastError ||= e; } }
  if (!entries) {
    if ([401, 403].includes(lastError?.status)) throw new Error('密钥无效或没有模型列表权限（HTTP ' + lastError.status + '）。可在高级设置中手动填写模型。');
    throw new Error('未能获取模型列表（' + (lastError?.message || '连接失败') + '）。请检查请求网址；也可展开高级设置手动配置。');
  }
  const unique = new Map();
  for (const item of entries) { if (typeof item.id === 'string' && item.id.trim() && item.lifecycle !== 'retired') unique.set(item.id.trim(), item); if (unique.size >= 2000) break; }
  if (!unique.size) throw new Error('接口返回的模型列表为空，请检查此 Key 的模型权限。');
  const metadata = Object.fromEntries([...unique].map(([id, raw]) => [id, capability(raw, catalog[id], protocol)]));
  const models = [...unique.keys()];
  return { ok: true, baseUrl: discoveredBase, protocol, authProtocol, models, metadata, count: models.length,
    defaultModel: models.includes(input.defaultModel) ? input.defaultModel : models[0],
    detection: { source: 'models-api', inferenceTested: false, at: new Date().toISOString() } };
}
module.exports = { normalizeUrl, authHeaders, capability, discover, PROTOCOLS, nativeEffort };
