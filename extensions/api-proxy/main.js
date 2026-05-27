const process = require('process');
const https = require('https');
const http = require('http');

const API_ORIGIN = 'https://rec.edualex.uy';

function nodeFetch(url, opts = {}) {
  return new Promise((resolve, reject) => {
    const u = new URL(url);
    const mod = u.protocol === 'https:' ? https : http;
    const req = mod.request({
      hostname: u.hostname,
      port: u.port || (u.protocol === 'https:' ? 443 : 80),
      path: u.pathname + u.search,
      method: opts.method || 'GET',
      headers: opts.headers || {},
      rejectUnauthorized: true
    }, (res) => {
      let body = '';
      res.on('data', (chunk) => body += chunk);
      res.on('end', () => resolve({ status: res.statusCode, body }));
    });
    req.on('error', (err) => reject(err));
    if (opts.body) req.write(opts.body);
    req.end();
  });
}

let stdinData = '';
process.stdin.resume();
process.stdin.on('data', (chunk) => {
  stdinData += chunk.toString();
  try {
    const input = JSON.parse(stdinData);
    start(input);
  } catch {}
});

function start(input) {
  const NL_PORT = input.nlPort;
  const NL_TOKEN = input.nlToken;
  const NL_CTOKEN = input.nlConnectToken;
  const NL_EXTID = input.nlExtensionId;

  const client = new WebSocket(`ws://localhost:${NL_PORT}?extensionId=${NL_EXTID}&connectToken=${NL_CTOKEN}`);

  client.onerror = () => process.exit();
  client.onclose = () => process.exit();
  client.onopen = () => {};

  client.onmessage = async (e) => {
    const { event, data } = JSON.parse(e.data);
    if (event !== 'apiRequest') return;

    const { id, method, path, body, origin } = data;

    try {
      const base = origin || API_ORIGIN;
      const url = `${base}${path}`;
      const opts = { method: method || 'GET', headers: {} };
      if (body && method !== 'GET') {
        opts.body = JSON.stringify(body);
        opts.headers['Content-Type'] = 'application/json';
      }

      const res = await nodeFetch(url, opts);
      let parsed;
      try { parsed = JSON.parse(res.body); } catch { parsed = res.body; }

      client.send(JSON.stringify({
        id: crypto.randomUUID(),
        method: 'app.broadcast',
        accessToken: NL_TOKEN,
        data: {
          event: 'apiResponse',
          data: { id, status: res.status, body: parsed }
        }
      }));
    } catch (err) {
      client.send(JSON.stringify({
        id: crypto.randomUUID(),
        method: 'app.broadcast',
        accessToken: NL_TOKEN,
        data: {
          event: 'apiResponse',
          data: { id, status: 0, body: null, error: err.message }
        }
      }));
    }
  };
}
