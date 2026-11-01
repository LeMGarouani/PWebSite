<<<<<<< HEAD
const { connectLambda, getStore } = require('@netlify/blobs');
const HAL_ID = '744405';
const MAX_AGE = 86400000;
const SNAPSHOT_KEY = `hal-${HAL_ID}-v1`;
=======
const HAL_ID = '744405';
const MAX_AGE = 86400000;
>>>>>>> f1c4bd721bfb9544d6f8cc4979055ca026ec8dd1
const TYPES = {
  ART: 'journal-article',
  COMM: 'conference-paper',
  COUV: 'book-chapter',
  PROCEEDINGS: 'conference-proceedings',
  UNDEFINED: 'preprint',
  WORKINGPAPER: 'working-paper',
  THESE: 'dissertation-thesis',
  HDR: 'dissertation-thesis',
  MEM: 'dissertation-thesis',
  POSTER: 'conference-poster',
  SOFTWARE: 'software',
};
let cached;

<<<<<<< HEAD
async function withStore(operation) {
  const controller = new AbortController();
  let timer;
  const timeout = new Promise((resolve, reject) => {
    timer = setTimeout(() => {
      const error = new Error('HAL persistent storage operation timed out');
      controller.abort(error);
      reject(error);
    }, 2000);
  });
  try {
    const store = getStore({
      name: 'publications',
      consistency: 'eventual',
      fetch: (url, options) => {
        controller.signal.throwIfAborted();
        return fetch(url, { ...options, signal: controller.signal });
      },
    });
    return await Promise.race([operation(store), timeout]);
  } finally {
    clearTimeout(timer);
    controller.abort();
  }
}

function validateSnapshot(snapshot) {
  if (!snapshot || snapshot.hal !== HAL_ID || !Number.isFinite(snapshot.timestamp) ||
      snapshot.timestamp <= 0 || snapshot.timestamp > Date.now() ||
      !Array.isArray(snapshot.works) || !snapshot.works.every(work =>
        work && /^[a-z]+-\d+$/.test(work.id) &&
        ['title', 'year', 'month', 'day', 'type', 'journal', 'doi', 'url']
          .every(key => typeof work[key] === 'string') &&
        Array.isArray(work.authors) && work.authors.every(author =>
          author && typeof author.name === 'string'))) {
    throw new Error('Invalid HAL persistent snapshot');
  }
  return snapshot;
}

=======
>>>>>>> f1c4bd721bfb9544d6f8cc4979055ca026ec8dd1
function normalizeWorks(docs) {
  const latest = new Map();
  for (const doc of docs) {
    if (!/^[a-z]+-\d+$/.test(doc.halId_s) || !Array.isArray(doc.title_s) ||
        typeof doc.title_s[0] !== 'string' || !doc.title_s[0].trim() ||
        !Number.isInteger(doc.version_i)) {
      throw new Error('Invalid HAL publication');
    }
    const previous = latest.get(doc.halId_s);
    if (!previous || previous.version_i < doc.version_i) latest.set(doc.halId_s, doc);
  }
  const byDoi = new Set();
  return [...latest.values()].sort((a, b) => a.halId_s.localeCompare(b.halId_s))
    .map(doc => {
      const date = /^(\d{4})(?:-(\d{2})(?:-(\d{2}))?)?$/.exec(doc.producedDate_s || '');
      return {
        id: doc.halId_s,
        title: doc.title_s[0],
        year: date ? date[1] : '',
        month: date && date[2] ? date[2] : '',
        day: date && date[3] ? date[3] : '',
        authors: (doc.authFullName_s || []).map(name => ({ name })),
        type: TYPES[doc.docType_s] || (doc.docType_s || 'other').toLowerCase(),
        journal: doc.journalTitle_s || doc.conferenceTitle_s || '',
        doi: (doc.doiId_s || '').replace(/^https?:\/\/(?:dx\.)?doi\.org\//i, '').trim(),
        url: `https://hal.science/${doc.halId_s}`,
      };
    }).filter(work => ['journal-article', 'conference-paper', 'book-chapter',
      'conference-proceedings', 'preprint', 'working-paper', 'dissertation-thesis'].includes(work.type))
    .filter(work => {
      if (!work.doi) return true;
      const key = work.doi.toLowerCase();
      if (byDoi.has(key)) return false;
      byDoi.add(key);
      return true;
    }).sort((a, b) => Number(b.year || 0) - Number(a.year || 0) ||
      Number(b.month || 0) - Number(a.month || 0) ||
      Number(b.day || 0) - Number(a.day || 0) ||
      a.title.localeCompare(b.title));
}

exports.normalizeWorks = normalizeWorks;
exports.handler = async (event) => {
  if (event.httpMethod !== 'GET') {
    return { statusCode: 405, headers: { Allow: 'GET' }, body: 'Method not allowed' };
  }
<<<<<<< HEAD
  let storageReady = false;
  let persistenceAvailable = !cached || cached.persistenceAvailable !== false;
  if (!event.localPreview) {
    try {
      connectLambda(event);
      storageReady = true;
      if (!cached) {
        const snapshot = await withStore(store => store.get(SNAPSHOT_KEY, { type: 'json' }));
        if (snapshot !== null) cached = { ...validateSnapshot(snapshot), persistenceAvailable: true };
      }
    } catch (error) {
      persistenceAvailable = false;
      console.error('HAL persistent snapshot read failed:', error);
    }
  }
=======
>>>>>>> f1c4bd721bfb9544d6f8cc4979055ca026ec8dd1
  let stale = false;
  try {
    if (!cached || Date.now() - cached.timestamp >= MAX_AGE) {
      const docs = [];
<<<<<<< HEAD
      const signal = AbortSignal.timeout(8000);
=======
      const signal = AbortSignal.timeout(10000);
>>>>>>> f1c4bd721bfb9544d6f8cc4979055ca026ec8dd1
      let total;
      do {
        const url = new URL('https://api.archives-ouvertes.fr/search/');
        url.search = new URLSearchParams({
          q: `authIdHal_i:${HAL_ID}`,
          wt: 'json', rows: '100', start: String(docs.length),
          sort: 'docid asc',
          fl: 'halId_s,title_s,authFullName_s,producedDate_s,docType_s,journalTitle_s,conferenceTitle_s,doiId_s,version_i',
        });
        const response = await fetch(url, { signal, headers: { Accept: 'application/json' } });
        if (!response.ok) throw new Error(`HAL returned HTTP ${response.status}`);
        const data = await response.json();
        const result = data.response;
        if (!result || !Array.isArray(result.docs) || !Number.isInteger(result.numFound) ||
            result.numFound < 0 || (docs.length < result.numFound && !result.docs.length)) {
          throw new Error('Invalid HAL search response');
        }
        total = result.numFound;
        docs.push(...result.docs);
      } while (docs.length < total);
<<<<<<< HEAD
      cached = { timestamp: Date.now(), works: normalizeWorks(docs), persistenceAvailable: false };
=======
      cached = { timestamp: Date.now(), works: normalizeWorks(docs) };
>>>>>>> f1c4bd721bfb9544d6f8cc4979055ca026ec8dd1
    }
  } catch (error) {
    console.error('HAL publications retrieval failed:', error);
    if (!cached) {
      return {
        statusCode: 502,
        headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' },
        body: JSON.stringify({ error: 'HAL is temporarily unavailable. Please try again later.' }),
      };
    }
    stale = true;
  }
<<<<<<< HEAD
  if (storageReady && cached.persistenceAvailable === false) {
    try {
      const snapshot = cached;
      await withStore(store => store.setJSON(SNAPSHOT_KEY, {
        hal: HAL_ID, timestamp: snapshot.timestamp, works: snapshot.works,
      }));
      snapshot.persistenceAvailable = true;
      persistenceAvailable = true;
    } catch (error) {
      persistenceAvailable = false;
      console.error('HAL persistent snapshot write failed:', error);
    }
    if (event.localPreview) persistenceAvailable = true;
  }
=======
>>>>>>> f1c4bd721bfb9544d6f8cc4979055ca026ec8dd1
  const remainingSeconds = Math.max(0, Math.floor((MAX_AGE - (Date.now() - cached.timestamp)) / 1000));
  return {
    statusCode: 200,
    headers: {
      'Content-Type': 'application/json', 'Cache-Control': 'no-cache',
<<<<<<< HEAD
      'Netlify-CDN-Cache-Control': stale || !persistenceAvailable || remainingSeconds === 0
=======
      'Netlify-CDN-Cache-Control': stale || remainingSeconds === 0
>>>>>>> f1c4bd721bfb9544d6f8cc4979055ca026ec8dd1
        ? 'no-store'
        : `public, s-maxage=${remainingSeconds}`,
    },
    body: JSON.stringify({
<<<<<<< HEAD
      hal: HAL_ID, updatedAt: new Date(cached.timestamp).toISOString(), stale,
      persistenceAvailable, works: cached.works,
=======
      hal: HAL_ID, updatedAt: new Date(cached.timestamp).toISOString(), stale, works: cached.works,
>>>>>>> f1c4bd721bfb9544d6f8cc4979055ca026ec8dd1
    }),
  };
};
