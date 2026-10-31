const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const postcss = require('postcss');

test('production CSS preserves runtime publication styling and accordion behavior', () => {
  const html = fs.readFileSync(path.join(__dirname, '../public/publications/index.html'), 'utf8');
  const stylesheet = [...html.matchAll(/<link\b[^>]*href=["']?([^"'\s>]+)[^>]*>/g)]
    .map(match => new URL(match[1], 'https://example.test').pathname)
    .find(url => /\/main[^/]*\.css$/.test(url));
  assert.ok(stylesheet, 'Production stylesheet must be linked from the publications page');
  const css = fs.readFileSync(path.join(__dirname, '../public', stylesheet), 'utf8');
  const rules = new Map();
  postcss.parse(css).walkRules(rule => {
    for (const selector of rule.selectors) rules.set(selector, rule);
  });
  const required = [
    ['.hal-publications .accordion-button', 'display', 'flex'],
    ['.hal-publications .accordion-button .badge', 'min-width', '2.5em'],
    ['.hal-publications .accordion-button::after', 'margin-left', '0'],
    ['.hal-publications .card-body .hal-author', 'color', 'var(--hal-author)'],
    ['.hal-publications .card-body p', 'color', 'var(--hal-text)'],
    ['.collapse:not(.show)', 'display', 'none'],
  ];
  for (const [selector, property, value] of required) {
    const rule = rules.get(selector);
    assert.ok(rule, `Production CSS must retain ${selector}`);
    assert.ok(rule.nodes.some(node => node.prop === property && node.value === value),
      `${selector} must retain ${property}: ${value}`);
  }
});
