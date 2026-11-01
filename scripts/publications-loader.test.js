const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');

const script = fs.readFileSync(require.resolve('../assets/js/hal-publications.js'), 'utf8');
const load = script.slice(script.indexOf('  const load = async () =>'), script.indexOf('  retry.addEventListener'));

for (const delay of [30, 400, 1200]) {
  test(`loader timing for a ${delay} ms response`, async () => {
    let shownAt = null;
    let visible = false;
    let renderedAt;
    const notice = {
      classList: { remove() {} },
      set hidden(value) {
        visible = !value;
        if (!value) shownAt = performance.now();
      },
    };
    const context = {
      notice,
      retry: {},
      status: { classList: { add() {}, remove() {} }, replaceChildren() {} },
      publicationsRoot: { querySelector: () => ({ content: { cloneNode() {} } }) },
      setTimeout, clearTimeout, performance, AbortSignal, console,
      endpoint: '/publications',
      source: 'HAL',
      cacheKey: 'test',
      localStorage: { setItem() {} },
      validate: data => data,
      fetch: async () => {
        await new Promise(resolve => setTimeout(resolve, delay));
        return { ok: true, json: async () => ({ works: [] }) };
      },
      render: () => { renderedAt = performance.now(); },
    };
    await vm.runInNewContext(`${load}\nload();`, context);
    if (delay < 250) {
      assert.equal(shownAt, null, 'Fast responses must not show the loader');
      assert.equal(visible, false);
    } else {
      assert.notEqual(shownAt, null);
      assert.ok(renderedAt - shownAt >= 690, 'Visible loader must last at least 700 ms (10 ms timer tolerance)');
      if (delay > 950) {
        assert.ok(renderedAt - shownAt < 1150, 'Slow responses must not add another minimum-duration wait');
      }
    }
  });
}
