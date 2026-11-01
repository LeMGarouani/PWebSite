const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const { normalizeWorks } = require('../functions/hal-publications');
const source = fs.readFileSync(require.resolve('../functions/hal-publications'), 'utf8');
<<<<<<< HEAD
const loadHandler = context => vm.runInNewContext(source, {
  ...context, AbortController, setTimeout, clearTimeout,
});
=======
>>>>>>> f1c4bd721bfb9544d6f8cc4979055ca026ec8dd1
const doc = (id, version = 1, doi = '') => ({
  halId_s: id, version_i: version, title_s: [`Title ${version}`],
  producedDate_s: '2025-05-20', authFullName_s: ['Moncef Garouani'],
  docType_s: 'ART', doiId_s: doi,
});

test('keeps latest version, deduplicates DOI and preserves full dates and authors', () => {
  const works = normalizeWorks([
    doc('hal-1', 1), doc('hal-1', 2, '10.123/ABC'),
    doc('hal-2', 1, '10.123/abc'), doc('tel-3'),
  ]);
  assert.equal(works.length, 2);
  assert.equal(works[0].title, 'Title 1');
  const latest = works.find(work => work.id === 'hal-1');
  assert.equal(latest.title, 'Title 2');
  assert.equal(latest.day, '20');
  assert.equal(latest.authors[0].name, 'Moncef Garouani');
  assert.throws(() => normalizeWorks([{}]), /Invalid HAL/);
});

test('maps HAL categories without inventing dates and excludes unsupported types', () => {
  for (const [type, expected] of [['COUV', 'book-chapter'], ['COMM', 'conference-paper'],
    ['THESE', 'dissertation-thesis'], ['UNDEFINED', 'preprint']]) {
    const work = normalizeWorks([{ ...doc('hal-1'), docType_s: type, producedDate_s: '2025' }])[0];
    assert.equal(work.type, expected);
    assert.equal(work.month, '');
    assert.equal(work.day, '');
  }
  for (const type of ['REPORT', 'OTHER', 'POSTER', 'SOFTWARE']) {
    assert.equal(normalizeWorks([{ ...doc('hal-1'), docType_s: type }]).length, 0);
  }
});

test('sorts full dates newest first, placing partial dates after known dates in the same period', () => {
  const dates = [
    ['2026-01-01', 'A January paper'],
    ['2026-12-01', 'Z December paper'],
    ['2026-12-20', 'B December paper'],
    ['2026-12', 'Month only'],
    ['2026', 'Year only'],
    ['', 'Undated'],
    ['2027', 'Next year'],
    ['2026-12-20', 'A December paper'],
  ];
  const works = normalizeWorks(dates.map(([date, title], index) => ({
    ...doc(`hal-${index + 1}`), producedDate_s: date, title_s: [title],
  })));
  assert.deepEqual(works.map(work => work.title), [
    'Next year', 'A December paper', 'B December paper', 'Z December paper',
    'Month only', 'A January paper', 'Year only', 'Undated',
  ]);
});

test('paginates, caches and serves explicit stale data; cold failures return 502', async () => {
  let time = Date.now();
  let calls = 0;
  const context = {
<<<<<<< HEAD
    require: () => ({ connectLambda() {}, getStore: () => ({
      get: async () => null, setJSON: async () => {},
    }) }),
=======
>>>>>>> f1c4bd721bfb9544d6f8cc4979055ca026ec8dd1
    exports: {}, URL, URLSearchParams, AbortSignal,
    Date: class extends Date { static now() { return time; } },
    console: { error() {} },
    fetch: async (url) => {
      calls++;
      if (calls > 2) throw new Error('HAL offline');
      const start = Number(url.searchParams.get('start'));
      return { ok: true, json: async () => ({
        response: { numFound: 2, docs: [doc(`hal-${start + 1}`)] },
      }) };
    },
  };
<<<<<<< HEAD
  loadHandler(context);
=======
  vm.runInNewContext(source, context);
>>>>>>> f1c4bd721bfb9544d6f8cc4979055ca026ec8dd1
  const handler = context.exports.handler;
  assert.equal((await handler({ httpMethod: 'POST' })).statusCode, 405);
  const initial = await handler({ httpMethod: 'GET' });
  assert.equal(JSON.parse(initial.body).works.length, 2);
  assert.equal(initial.headers['Netlify-CDN-Cache-Control'], 'public, s-maxage=86400');
  time += 23 * 3600000;
  const aged = await handler({ httpMethod: 'GET' });
  assert.equal(aged.headers['Netlify-CDN-Cache-Control'], 'public, s-maxage=3600');
  assert.equal(JSON.parse(aged.body).updatedAt, JSON.parse(initial.body).updatedAt);
  time += 3599500;
  const nearExpiry = await handler({ httpMethod: 'GET' });
  assert.equal(nearExpiry.headers['Netlify-CDN-Cache-Control'], 'no-store');
  await handler({ httpMethod: 'GET' });
  assert.equal(calls, 2);
  time += 501;
  const stale = await handler({ httpMethod: 'GET' });
  assert.equal(JSON.parse(stale.body).stale, true);
  assert.equal(stale.headers['Netlify-CDN-Cache-Control'], 'no-store');
  const cold = { ...context, exports: {} };
<<<<<<< HEAD
  loadHandler(cold);
  assert.equal((await cold.exports.handler({ httpMethod: 'GET' })).statusCode, 502);
});

test('a fresh instance loads a saved snapshot without calling HAL', async () => {
  const timestamp = Date.now();
  const snapshot = { hal: '744405', timestamp, works: normalizeWorks([doc('hal-1')]) };
  const context = {
    exports: {}, URL, URLSearchParams, AbortSignal, Date, console,
    require: () => ({
      connectLambda() {},
      getStore: () => ({
        get: async () => snapshot,
        setJSON: async () => assert.fail('Fresh backup must not be rewritten'),
      }),
    }),
    fetch: async () => assert.fail('Fresh backup must avoid HAL'),
  };
  loadHandler(context);
  const result = await context.exports.handler({ httpMethod: 'GET' });
  assert.equal(result.statusCode, 200);
  assert.equal(JSON.parse(result.body).works.length, 1);
  assert.equal(JSON.parse(result.body).updatedAt, new Date(timestamp).toISOString());
});

test('successful retrieval survives a new instance and HAL timeout', async () => {
  let time = Date.now();
  let saved = null;
  let offline = false;
  const context = () => ({
    exports: {}, URL, URLSearchParams, AbortSignal,
    Date: class extends Date { static now() { return time; } },
    console: { error() {} },
    require: () => ({
      connectLambda() {},
      getStore: () => ({
        get: async () => saved,
        setJSON: async (key, value) => { saved = JSON.parse(JSON.stringify(value)); },
      }),
    }),
    fetch: async () => {
      if (offline) throw new DOMException('HAL timeout', 'TimeoutError');
      return { ok: true, json: async () => ({
        response: { numFound: 1, docs: [doc('hal-1')] },
      }) };
    },
  });
  const first = context();
  loadHandler(first);
  assert.equal((await first.exports.handler({ httpMethod: 'GET' })).statusCode, 200);
  assert.equal(saved.works.length, 1);
  const timestamp = saved.timestamp;
  time += 86400001;
  offline = true;
  const cold = context();
  loadHandler(cold);
  const result = await cold.exports.handler({ httpMethod: 'GET' });
  assert.equal(result.statusCode, 200);
  const data = JSON.parse(result.body);
  assert.equal(data.stale, true);
  assert.equal(data.works.length, 1);
  assert.equal(saved.timestamp, timestamp, 'Failed refresh must not overwrite backup');
  assert.equal(result.headers['Netlify-CDN-Cache-Control'], 'no-store');
});

test('storage failures are explicit, do not hide live works, and are not CDN cached', async () => {
  for (const failRead of [true, false]) {
    const context = {
      exports: {}, URL, URLSearchParams, AbortSignal, Date,
      console: { error() {} },
      require: () => ({
        connectLambda() {},
        getStore: () => ({
          get: async () => {
            if (failRead) throw new Error('Storage unavailable');
            return null;
          },
          setJSON: async () => { throw new Error('Write failed'); },
        }),
      }),
      fetch: async () => ({ ok: true, json: async () => ({
        response: { numFound: 1, docs: [doc('hal-1')] },
      }) }),
    };
    loadHandler(context);
    const result = await context.exports.handler({ httpMethod: 'GET' });
    assert.equal(result.statusCode, 200);
    assert.equal(JSON.parse(result.body).persistenceAvailable, false);
    assert.equal(result.headers['Netlify-CDN-Cache-Control'], 'no-store');
  }
});

test('a corrupt backup and HAL failure still return an explicit 502', async () => {
  const context = {
    exports: {}, URL, URLSearchParams, AbortSignal, Date,
    console: { error() {} },
    require: () => ({
      connectLambda() {},
      getStore: () => ({ get: async () => ({ works: 'invalid' }) }),
    }),
    fetch: async () => { throw new Error('HAL offline'); },
  };
  loadHandler(context);
  assert.equal((await context.exports.handler({ httpMethod: 'GET' })).statusCode, 502);
});

test('a warm instance persists an unsaved snapshot after initialization recovers', async () => {
  let initialize = false;
  let writes = 0;
  let halCalls = 0;
  const context = {
    exports: {}, URL, URLSearchParams, AbortSignal, Date,
    console: { error() {} },
    require: () => ({
      connectLambda() {
        if (!initialize) throw new Error('Storage context unavailable');
      },
      getStore: () => ({
        get: async () => null,
        setJSON: async () => { writes++; },
      }),
    }),
    fetch: async () => {
      halCalls++;
      return { ok: true, json: async () => ({
        response: { numFound: 1, docs: [doc('hal-1')] },
      }) };
    },
  };
  loadHandler(context);
  const first = await context.exports.handler({ httpMethod: 'GET' });
  assert.equal(JSON.parse(first.body).persistenceAvailable, false);
  assert.equal(first.headers['Netlify-CDN-Cache-Control'], 'no-store');
  assert.equal(writes, 0);
  initialize = true;
  const recovered = await context.exports.handler({ httpMethod: 'GET' });
  assert.equal(writes, 1);
  assert.equal(halCalls, 1, 'Fresh memory snapshot should be saved without refetching HAL');
  assert.equal(JSON.parse(recovered.body).persistenceAvailable, true);
  assert.match(recovered.headers['Netlify-CDN-Cache-Control'], /^public, s-maxage=/);
});

test('failed writes remain unavailable on warm requests until a write succeeds', async () => {
  let fail = true;
  let writes = 0;
  const context = {
    exports: {}, URL, URLSearchParams, AbortSignal, Date,
    console: { error() {} },
    require: () => ({
      connectLambda() {},
      getStore: () => ({
        get: async () => null,
        setJSON: async () => {
          writes++;
          if (fail) throw new Error('Storage offline');
        },
      }),
    }),
    fetch: async () => ({ ok: true, json: async () => ({
      response: { numFound: 1, docs: [doc('hal-1')] },
    }) }),
  };
  loadHandler(context);
  for (let i = 0; i < 2; i++) {
    const result = await context.exports.handler({ httpMethod: 'GET' });
    assert.equal(JSON.parse(result.body).persistenceAvailable, false);
    assert.equal(result.headers['Netlify-CDN-Cache-Control'], 'no-store');
  }
  fail = false;
  const recovered = await context.exports.handler({ httpMethod: 'GET' });
  assert.equal(JSON.parse(recovered.body).persistenceAvailable, true);
  assert.equal(writes, 3);
});
=======
  vm.runInNewContext(source, cold);
  assert.equal((await cold.exports.handler({ httpMethod: 'GET' })).statusCode, 502);
});
>>>>>>> f1c4bd721bfb9544d6f8cc4979055ca026ec8dd1
