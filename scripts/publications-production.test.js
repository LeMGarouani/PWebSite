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
  const root = postcss.parse(css);
  root.walkRules(rule => {
    for (const selector of rule.selectors) {
      if (!rules.has(selector)) rules.set(selector, []);
      rules.get(selector).push(rule);
    }
  });
  const required = [
    ['.hal-publications .accordion-button', 'display', 'flex'],
    ['.hal-publications .accordion-button .badge', 'min-width', '2.5em'],
    ['.hal-publications .accordion-button .badge', 'background-color', 'var(--hal-author)'],
    ['.hal-publications .accordion-button::after', 'margin-left', '0'],
    ['.hal-publications .card-body .hal-author', 'color', 'var(--hal-author)'],
    ['.hal-publications .card-body p', 'color', 'var(--hal-text)'],
    ['.collapse:not(.show)', 'display', 'none'],
    ['.hal-publications .hal-neural', 'width', '5rem'],
    ['.hal-publications .hal-loading', 'flex-direction', 'column'],
    ['.hal-publications .hal-loading', 'text-align', 'center'],
    ['.hal-publications .hal-retry.btn', 'color', 'var(--hal-author)'],
    ['.hal-publications .hal-retry[hidden]', 'display', 'none'],
    ['.hal-publications .hal-retry-icon', 'width', '1.5rem'],
    ['[data-dark-mode] .hal-publications .card-body .hal-author', 'color', '#8ed6fb'],
    ['[data-dark-mode] .hal-publications .hal-retry.btn', 'color', '#8ed6fb'],
    ['[data-dark-mode] .hal-publications', '--hal-author', '#8ed6fb'],
    ['.hal-publications .hal-neural-signals path', 'stroke-dasharray', '12 88'],
  ];
  for (const [selector, property, value] of required) {
    const rule = rules.get(selector);
    assert.ok(rule, `Production CSS must retain ${selector}`);
    assert.ok(rule.some(candidate => candidate.nodes.some(node => node.prop === property && node.value === value)),
      `${selector} must retain ${property}: ${value}`);
  }
  const animations = [];
  root.walkAtRules('keyframes', rule => animations.push(rule.params));
  assert.ok(animations.includes('hal-neural-flow'), 'Signal animation must survive optimization');
  assert.ok(animations.includes('hal-neural-pulse'), 'Core animation must survive optimization');
  let reducedMotion = false;
  root.walkAtRules('media', media => {
    if (!media.params.includes('prefers-reduced-motion')) return;
    media.walkRules(rule => {
      if (!rule.selectors.includes('.hal-publications .hal-neural-signals path')) return;
      reducedMotion = rule.nodes.some(node => node.prop === 'animation' && node.value === 'none');
    });
  });
  assert.ok(reducedMotion, 'Reduced-motion preference must disable signal animation');
});
