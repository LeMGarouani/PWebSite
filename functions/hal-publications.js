const HAL_ID = '744405';
const MAX_AGE = 86400000;
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
  let stale = false;
  try {
    if (!cached || Date.now() - cached.timestamp >= MAX_AGE) {
      const docs = [];
      const signal = AbortSignal.timeout(10000);
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
      cached = { timestamp: Date.now(), works: normalizeWorks(docs) };
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
  const remainingSeconds = Math.max(0, Math.floor((MAX_AGE - (Date.now() - cached.timestamp)) / 1000));
  return {
    statusCode: 200,
    headers: {
      'Content-Type': 'application/json', 'Cache-Control': 'no-cache',
      'Netlify-CDN-Cache-Control': stale || remainingSeconds === 0
        ? 'no-store'
        : `public, s-maxage=${remainingSeconds}`,
    },
    body: JSON.stringify({
      hal: HAL_ID, updatedAt: new Date(cached.timestamp).toISOString(), stale, works: cached.works,
    }),
  };
};
