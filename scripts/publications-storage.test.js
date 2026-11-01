const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');

// Keep real SDK retries fast while exercising its production retry logic.
const previousEnvironment = process.env.NODE_ENV;
process.env.NODE_ENV = 'test';
const blobs = require('@netlify/blobs');
if (previousEnvironment === undefined) delete process.env.NODE_ENV;
else process.env.NODE_ENV = previousEnvironment;

const source = fs.readFileSync(require.resolve('../functions/hal-publications'), 'utf8');
const event = {
  httpMethod: 'GET',
  headers: { 'x-nf-site-id': 'test-site', 'x-nf-deploy-id': 'test-deploy' },
  blobs: Buffer.from(JSON.stringify({
    url: 'https://storage.example.test', token: 'test-token',
  })).toString('base64'),
};
const createHandler = (fetch) => {
  const context = {
    exports: {}, require: () => blobs, fetch, URL, URLSearchParams,
    AbortController, AbortSignal, Date, setTimeout, clearTimeout,
    console: { error() {} },
  };
  vm.runInNewContext(source, context);
  return context.exports.handler;
};
const live = () => Response.json({
  response: { numFound: 1, docs: [{
    halId_s: 'hal-1', title_s: ['Test publication'], version_i: 1, docType_s: 'ART',
  }] },
});

test('real SDK reads and writes with the supplied Lambda context', async () => {
  let saved = null;
  const methods = [];
  const handler = createHandler(async (url, options) => {
    if (new URL(url).hostname === 'api.archives-ouvertes.fr') return live();
    methods.push(options.method.toUpperCase());
    if (options.method.toUpperCase() === 'GET') return new Response(null, { status: 404 });
    saved = JSON.parse(options.body);
    return new Response(null, { status: 200 });
  });
  const result = await handler(event);
  assert.equal(JSON.parse(result.body).persistenceAvailable, true);
  assert.deepEqual(methods, ['GET', 'PUT']);
  assert.equal(saved.hal, '744405');
  assert.equal(saved.works.length, 1);
  const coldHandler = createHandler(async () => Response.json(saved));
  const restored = await coldHandler(event);
  assert.equal(JSON.parse(restored.body).works.length, 1);
});

test('real SDK retries fit inside the whole-operation storage budget', async () => {
  let reads = 0;
  let writes = 0;
  const handler = createHandler(async (url, options) => {
    if (new URL(url).hostname === 'api.archives-ouvertes.fr') return live();
    if (options.method.toUpperCase() === 'GET') {
      reads++;
      return new Response(null, { status: 503 });
    }
    writes++;
    return new Response(null, { status: 200 });
  });
  const start = performance.now();
  const result = await handler(event);
  assert.ok(performance.now() - start < 2500);
  assert.equal(reads, 6, 'Exercise the actual SDK retry loop');
  assert.equal(writes, 1);
  assert.equal(JSON.parse(result.body).persistenceAvailable, true);
});

test('the total budget also bounds time spent across SDK retries', async () => {
  let attempts = 0;
  const handler = createHandler(async (url, options) => {
    if (new URL(url).hostname === 'api.archives-ouvertes.fr') return live();
    if (options.method.toUpperCase() === 'PUT') return new Response(null, { status: 200 });
    attempts++;
    return new Promise((resolve, reject) => {
      const timer = setTimeout(() => {
        options.signal.removeEventListener('abort', abort);
        resolve(new Response(null, { status: 503 }));
      }, 600);
      const abort = () => {
        clearTimeout(timer);
        reject(options.signal.reason);
      };
      options.signal.addEventListener('abort', abort, { once: true });
    });
  });
  const start = performance.now();
  const result = await handler(event);
  const elapsed = performance.now() - start;
  assert.ok(elapsed >= 1950 && elapsed < 2700, `Retries took ${elapsed} ms`);
  assert.ok(attempts > 1, 'Multiple SDK attempts must have been exercised');
  const countAtTimeout = attempts;
  await new Promise(resolve => setTimeout(resolve, 50));
  assert.equal(attempts, countAtTimeout);
  assert.equal(JSON.parse(result.body).persistenceAvailable, true);
});

for (const operation of ['GET', 'PUT']) {
  test(`real SDK ${operation} timeout returns promptly and prevents late network retries`, async () => {
    let attempts = 0;
    const handler = createHandler(async (url, options) => {
      if (new URL(url).hostname === 'api.archives-ouvertes.fr') return live();
      if (options.method.toUpperCase() !== operation) {
        return options.method.toUpperCase() === 'GET'
          ? new Response(null, { status: 404 })
          : new Response(null, { status: 200 });
      }
      attempts++;
      return new Promise((resolve, reject) => {
        options.signal.addEventListener('abort', () => reject(options.signal.reason), { once: true });
      });
    });
    const start = performance.now();
    const result = await handler(event);
    const elapsed = performance.now() - start;
    assert.ok(elapsed >= 1950 && elapsed < 2700, `Operation took ${elapsed} ms`);
    const data = JSON.parse(result.body);
    assert.equal(data.works.length, 1);
    assert.equal(data.persistenceAvailable, operation === 'GET');
    await new Promise(resolve => setTimeout(resolve, 50));
    assert.equal(attempts, 1, 'No additional network request may start after the budget expires');
  });
}
