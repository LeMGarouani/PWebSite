const publicationsRoot = document.querySelector('[data-hal-publications]');

function formatAuthorName(name) {
  const normalized = name.trim().replace(/\s+/g, ' ');
  const comma = normalized.indexOf(',');
  const surname = comma >= 0 ? normalized.slice(0, comma).trim() : normalized.split(' ').pop();
  const givenNames = comma >= 0 ? normalized.slice(comma + 1).trim() : normalized.slice(0, -surname.length).trim();
  if (!givenNames || !surname) return normalized;
  const initials = givenNames.split(/[\s.-]+/).filter(Boolean)
    .map(part => `${Array.from(part)[0].toLocaleUpperCase()}.`).join('');
  return `${initials}${surname}`;
}

if (publicationsRoot) {
  const status = publicationsRoot.querySelector('[data-hal-status]');
  const list = publicationsRoot.querySelector('[data-hal-list]');
  const retry = publicationsRoot.querySelector('[data-hal-retry]');
  const source = 'HAL';
  const profile = '744405';
  const endpoint = '/.netlify/functions/hal-publications';
  const cacheKey = `${source.toLowerCase()}-publications:${profile}:v2`;

  const validate = (data) => {
    if (!data || data.hal !== profile ||
        !Number.isFinite(Date.parse(data.updatedAt)) || !Array.isArray(data.works) ||
        !data.works.every(work => /^[a-z]+-\d+$/.test(work.id) &&
          ['title', 'year', 'month', 'day', 'type', 'journal', 'doi', 'url'].every(key => typeof work[key] === 'string') &&
          Array.isArray(work.authors) && work.authors.every(author =>
            typeof author.name === 'string'))) {
      throw new Error('Invalid publications response');
    }
    return data;
  };

  const formatDate = (work) => {
    if (!/^\d{4}$/.test(work.year)) return '';
    const month = Number(work.month);
    const day = Number(work.day);
    if (!Number.isInteger(month) || month < 1 || month > 12) return work.year;
    const date = new Date(Date.UTC(Number(work.year), month - 1, 1));
    const monthLabel = date.toLocaleDateString('en-US', { month: 'long', timeZone: 'UTC' });
    const maxDay = new Date(Date.UTC(Number(work.year), month, 0)).getUTCDate();
    return Number.isInteger(day) && day >= 1 && day <= maxDay
      ? `${monthLabel} ${day}, ${work.year}`
      : `${monthLabel} ${work.year}`;
  };

  const render = (data, stale) => {
    list.replaceChildren();
    const categories = [
      { id: 'articles', label: '📖 Articles', types: ['journal-article'] },
      { id: 'conferences', label: '📝 Conferences', types: ['conference-paper', 'conference-abstract', 'conference-proceedings', 'book-chapter'] },
      { id: 'preprints', label: '📄 Preprint', types: ['preprint', 'working-paper'] },
      { id: 'theses', label: '📓 Theses', types: ['dissertation-thesis'] },
      { id: 'others', label: 'Other publications', types: [] },
    ];
    const groups = new Map(categories.map(category => [category.id, []]));
    data.works.forEach(work => {
      const category = categories.find(category => category.types.includes(work.type)) ||
        categories[categories.length - 1];
      groups.get(category.id).push(work);
    });
    const containers = new Map();
    categories.forEach(category => {
      const works = groups.get(category.id);
      if (category.id === 'others' && !works.length) return;
      const item = document.createElement('section');
      item.className = 'accordion-item';
      item.dataset.halCategory = category.id;
      const heading = document.createElement('h2');
      heading.className = 'accordion-header';
      heading.id = `hal-heading-${category.id}`;
      const button = document.createElement('button');
      const expanded = category.id === 'articles';
      button.className = `accordion-button${expanded ? '' : ' collapsed'}`;
      button.type = 'button';
      button.setAttribute('data-bs-toggle', 'collapse');
      button.setAttribute('data-bs-target', `#hal-panel-${category.id}`);
      button.setAttribute('aria-expanded', String(expanded));
      button.setAttribute('aria-controls', `hal-panel-${category.id}`);
      const label = document.createElement('b');
      label.textContent = category.label;
      const badge = document.createElement('span');
      badge.className = 'badge rounded-pill bg-info ms-auto me-3';
      badge.textContent = String(works.length);
      const accessibleLabel = document.createElement('span');
      accessibleLabel.className = 'visually-hidden';
      accessibleLabel.textContent = ' publications';
      badge.append(accessibleLabel);
      button.append(label, badge);
      heading.append(button);
      const panel = document.createElement('div');
      panel.id = `hal-panel-${category.id}`;
      panel.className = `accordion-collapse collapse${expanded ? ' show' : ''}`;
      panel.setAttribute('aria-labelledby', heading.id);
      const cards = document.createElement('div');
      cards.className = 'card-list';
      if (!works.length) {
        const empty = document.createElement('p');
        empty.className = 'p-3';
        empty.textContent = `No public ${source} publications in this category.`;
        cards.append(empty);
      }
      containers.set(category.id, cards);
      panel.append(cards);
      item.append(heading, panel);
      list.append(item);
    });
    data.works.forEach(work => {
      const card = document.createElement('div');
      card.className = 'card mb-2';
      const body = document.createElement('div');
      body.className = 'card-body';
      const heading = document.createElement('h2');
      heading.className = 'h5';
      const link = document.createElement('a');
      link.className = 'text-body';
      link.textContent = work.title;
      link.href = work.doi
        ? `https://doi.org/${encodeURI(work.doi)}`
        : `https://hal.science/${work.id}`;
      link.target = '_blank';
      link.rel = 'noopener noreferrer';
      heading.append(link);
      body.append(heading);
      if (work.journal) {
        const journal = document.createElement('p');
        const italic = document.createElement('i');
        italic.textContent = work.journal;
        journal.append(italic);
        body.append(journal);
      }
      const meta = document.createElement('p');
      const small = document.createElement('small');
      const date = formatDate(work);
      small.append(date ? `Published on ${date}` : 'Publication date unavailable');
      if (work.authors.length) {
        small.append(' by ');
        work.authors.forEach((author, index) => {
          if (index > 0) small.append(index === work.authors.length - 1 ? ' and ' : ', ');
          const name = document.createElement('span');
          name.className = 'hal-author';
          name.textContent = formatAuthorName(author.name);
          name.title = author.name;
          name.setAttribute('aria-label', author.name);
          small.append(name);
        });
      } else {
        small.append(` · Authors unavailable on ${source}`);
      }
      meta.append(small);
      body.append(meta);
      card.append(body);
      const category = categories.find(category => category.types.includes(work.type)) ||
        categories[categories.length - 1];
      if (category.id === 'others') {
        const type = document.createElement('p');
        type.className = 'text-muted';
        type.textContent = work.type.replace(/-/g, ' ');
        body.append(type);
      }
      containers.get(category.id).append(card);
    });
    status.hidden = !stale && data.works.length > 0;
    retry.hidden = !stale;
    status.textContent = stale
      ? `${source} unavailable. Showing a saved copy retrieved ${new Date(data.updatedAt).toLocaleString()}.`
      : `No public publications found on this ${source} profile.`;
  };

  const load = async () => {
    retry.disabled = true;
    status.hidden = false;
    status.textContent = `Loading publications from ${source}...`;
    try {
      const response = await fetch(endpoint, {
        signal: AbortSignal.timeout(15000),
      });
      if (!response.ok) throw new Error(`Publications request failed: HTTP ${response.status}`);
      const data = validate(await response.json());
      render(data, data.stale);
      try {
        localStorage.setItem(cacheKey, JSON.stringify(data));
      } catch (error) {
        console.warn('Unable to save the publications offline copy:', error);
      }
    } catch (error) {
      console.error(`Unable to load ${source} publications:`, error);
      status.hidden = false;
      retry.hidden = false;
      status.textContent = 'Unable to load publications. Please retry.';
      try {
        const saved = localStorage.getItem(cacheKey);
        if (saved) render(validate(JSON.parse(saved)), true);
      } catch (cacheError) {
        console.warn('Unable to read the publications offline copy:', cacheError);
      }
    } finally {
      retry.disabled = false;
    }
  };

  retry.addEventListener('click', load);
  load();
}
