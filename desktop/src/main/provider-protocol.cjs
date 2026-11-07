'use strict';
const { authHeaders } = require('./provider-discovery.cjs');
function anthropicContent(content) {
  if (typeof content === 'string') return content ? [{ type: 'text', text: content }] : [];
  return (content || []).map(part => {
    if (part.type === 'text') return { type: 'text', text: part.text };
    if (part.type === 'image_url') {
      const url = part.image_url?.url || '';
      const match = /^data:([^;]+);base64,(.*)$/s.exec(url);
      return { type: 'image', source: match ? { type: 'base64', media_type: match[1], data: match[2] } : { type: 'url', url } };
    }
    throw new Error('此消息包含尚未适配的内容类型：' + part.type);
  });
}
function anthropicRequest(body) {
  const messages = [], system = [];
  for (const message of body.messages || []) {
    if (['system', 'developer'].includes(message.role)) { system.push(...anthropicContent(message.content)); continue; }
    const role = message.role === 'tool' ? 'user' : message.role;
    const content = message.role === 'tool' ? [{ type: 'tool_result', tool_use_id: message.tool_call_id, content: typeof message.content === 'string' ? message.content : JSON.stringify(message.content) }] : anthropicContent(message.content);
    for (const tool of message.tool_calls || []) content.push({ type: 'tool_use', id: tool.id, name: tool.function.name, input: JSON.parse(tool.function.arguments || '{}') });
    if (!content.length) continue;
    if (messages.at(-1)?.role === role) messages.at(-1).content.push(...content); else messages.push({ role, content });
  }
  const result = { model: body.model, messages, max_tokens: body.max_tokens || body.max_completion_tokens || 8192, stream: Boolean(body.stream) };
  if (system.length) result.system = system;
  if (body.tools?.length) result.tools = body.tools.filter(t => t.type === 'function').map(t => ({ name: t.function.name, description: t.function.description || '', input_schema: t.function.parameters || { type: 'object', properties: {} } }));
  for (const key of ['temperature', 'top_p']) if (body[key] !== undefined) result[key] = body[key];
  if (body.stop) result.stop_sequences = Array.isArray(body.stop) ? body.stop : [body.stop];
  if (body.tool_choice === 'required') result.tool_choice = { type: 'any' };
  else if (body.tool_choice === 'none' || body.tool_choice === 'auto') result.tool_choice = { type: body.tool_choice };
  else if (body.tool_choice?.function) result.tool_choice = { type: 'tool', name: body.tool_choice.function.name };
  return result;
}
function applyEffort(body, metadata, selected, protocol) {
  const info = metadata?.discovery;
  if (!info || info.status !== 'reported') return body;
  // Never send a guessed level. The native engine accepts a narrower vocabulary;
  // the discovery map translates that vocabulary to the provider's exact value.
  delete body.reasoning_effort; delete body.reasoning;
  const value = info.effortMap?.[selected];
  if (!value) return body;
  if (protocol === 'anthropic') {
    body.output_config = { ...body.output_config, effort: value };
    if (info.adaptive) body.thinking = { type: 'adaptive' };
  } else body.reasoning_effort = value;
  return body;
}
function requestFor(config, body, effort) {
  const anthropic = config.protocol === 'anthropic';
  const converted = anthropic ? anthropicRequest(body) : { ...body };
  const metadata = config.metadata?.[body.model];
  const maximum = Math.min(config.maxTokens, metadata?.maxOutputTokens || config.maxTokens);
  if (anthropic || converted.max_tokens) converted.max_tokens = Math.min(converted.max_tokens || maximum, maximum);
  if (converted.max_completion_tokens) converted.max_completion_tokens = Math.min(converted.max_completion_tokens, maximum);
  applyEffort(converted, metadata, effort, config.protocol);
  return { url: config.baseUrl + (anthropic ? '/messages' : '/chat/completions'),
    headers: { ...authHeaders(config.apiKey, config.authProtocol || (anthropic ? 'anthropic' : 'openai')), ...(anthropic ? {'anthropic-version':'2023-06-01'} : {}) }, body: converted };
}
async function* events(stream) {
  const reader = stream.getReader(), decoder = new TextDecoder(); let buffer = '';
  function decode(frame) { const data = frame.split('\n').filter(line => line.startsWith('data:')).map(line => line.slice(5).trimStart()).join('\n'); return data && data !== '[DONE]' ? JSON.parse(data) : null; }
  try {
    while (true) {
      const { value, done } = await reader.read(); buffer += done ? decoder.decode() : decoder.decode(value, { stream: true }); buffer = buffer.replace(/\r\n/g, '\n');
      let boundary;
      while ((boundary = buffer.indexOf('\n\n')) >= 0) { const frame = buffer.slice(0, boundary); buffer = buffer.slice(boundary + 2); const parsed = decode(frame); if (parsed) yield parsed; }
      if (buffer.length > 8 * 1024 * 1024) throw new Error('模型事件超过大小限制。');
      if (done) { if (buffer.trim()) { const parsed = decode(buffer); if (parsed) yield parsed; } break; }
    }
  } finally { reader.releaseLock(); }
}
const finishReason = reason => reason === 'tool_use' ? 'tool_calls' : reason === 'max_tokens' ? 'length' : 'stop';
async function write(response, value) { if (!response.write(value)) await new Promise(resolve => response.once('drain', resolve)); }
async function relayAnthropic(upstream, response, model, streaming) {
  if (!streaming) {
    const result = await upstream.json(); const blocks = result.content || [];
    response.writeHead(200, { 'Content-Type': 'application/json' });
    return response.end(JSON.stringify({ id: result.id, object: 'chat.completion', model: result.model || model, choices: [{ index: 0, finish_reason: finishReason(result.stop_reason), message: { role: 'assistant', content: blocks.filter(b => b.type === 'text').map(b => b.text).join(''), tool_calls: blocks.filter(b => b.type === 'tool_use').map(b => ({ id: b.id, type: 'function', function: { name: b.name, arguments: JSON.stringify(b.input) } })) } }], usage: { prompt_tokens: result.usage?.input_tokens || 0, completion_tokens: result.usage?.output_tokens || 0 } }));
  }
  response.writeHead(200, { 'Content-Type': 'text/event-stream', 'Cache-Control': 'no-cache' });
  const tools = new Map(); let id = 'gateway-message', toolIndex = 0;
  const chunk = async (delta, finish = null) => write(response, 'data: ' + JSON.stringify({ id, object: 'chat.completion.chunk', model, choices: [{ index: 0, delta, finish_reason: finish }] }) + '\n\n');
  for await (const event of events(upstream.body)) {
    if (event.type === 'error') { await write(response, 'data: ' + JSON.stringify({ error: { message: event.error?.message || '模型服务返回错误。' } }) + '\n\n'); break; }
    if (event.type === 'message_start') { id = event.message?.id || id; await chunk({ role: 'assistant', content: '' }); }
    if (event.type === 'content_block_start' && event.content_block?.type === 'tool_use') {
      const index = toolIndex++; tools.set(event.index, index);
      const block = event.content_block; await chunk({ tool_calls: [{ index, id: block.id, type: 'function', function: { name: block.name, arguments: Object.keys(block.input || {}).length ? JSON.stringify(block.input) : '' } }] });
    }
    if (event.type === 'content_block_delta') {
      if (event.delta?.type === 'text_delta') await chunk({ content: event.delta.text });
      if (event.delta?.type === 'thinking_delta') await chunk({ reasoning_content: event.delta.thinking });
      if (event.delta?.type === 'input_json_delta' && tools.has(event.index)) await chunk({ tool_calls: [{ index: tools.get(event.index), function: { arguments: event.delta.partial_json } }] });
    }
    if (event.type === 'message_delta' && event.delta?.stop_reason) await chunk({}, finishReason(event.delta.stop_reason));
  }
  await write(response, 'data: [DONE]\n\n'); response.end();
}
module.exports = { anthropicRequest, applyEffort, requestFor, events, relayAnthropic };
