# Personal website

## Description

Personal website using the Hugo [docks](https://getdoks.org/) theme.

## How to update?

This website is generated using [hugo](https://gohugo.io/), a static website generation framework.

Use Node.js 22 and install the locked dependencies (including Hugo Extended):

```bash
npm ci
```

Run the website locally:

```bash
npm start
```

Build the production website into `public`:

```bash
npm run build
```

## Netlify deployment

Netlify uses Node.js 22 and runs `npm run build`, publishing `public`.
Keep `package-lock.json` committed so deployments use reproducible dependencies.
FlexSearch is pinned to 0.7.21 because Doks 0.4 expects
`dist/flexsearch.bundle.js`, which newer 0.7.x releases no longer provide.

After deploying this build fix, clear the Netlify build cache and redeploy.

## Copyright year

The footer replaces `{year}` with the build year as a no-JavaScript fallback.
The custom JavaScript updates `[data-copyright-year]` to the visitor's current
year on each page load, without requiring a new deployment.
The RSS copyright notice omits the year because feeds do not execute JavaScript.

## HAL publications

The main `/publications/` page loads public works for
IdHAL `744405` at runtime. The existing navigation points to this page.
The former `/publications-orcid/` and `/publications-hal/` test addresses redirect to `/publications/`
on Netlify and through the local preview server.
Existing publication detail pages and downloadable files are retained.
Only public HAL notices are included; ORCID and Google Scholar are not synchronized.
The list displays titles and italic journal names, followed by
"Published on [date] by [authors]", using the HAL search API.
Partial dates keep their original precision (year or month and year);
missing authors and dates are explicitly indicated, never inferred.
Author names use uppercase given-name initials followed by the surname
(for example, `Mohammed Garouani` becomes `M.Garouani`); full names remain
available on hover and to assistive technology. Unstructured names use the
last word as the surname, or preserve the surname before a comma when present.
Collapsible sections group works by their HAL types, with live counts:
Articles, Conferences, Preprint and Theses. Conferences includes book chapters;
Preprint includes preprints and working papers. There are no separate software
or poster sections. Reports and other unsupported types are excluded.
Empty primary categories remain visible with a zero count.
Publication card styles are scoped to `.hal-publications`, with separate light
and dark text and author colors for readable metadata.
The integration does not create article pages or import abstracts or PDFs.

On Netlify, the function `hal-publications` uses the public HAL API without
credentials. Successful responses are cached for up to 24 hours in the Netlify
CDN and in each warm function instance. A stale warm-instance copy is served
with a warning if HAL fails. The browser also saves the last successful list
in local storage, showing it with a warning on network errors.
This is not a shared persistent server backup: a first-time visitor can receive
an error during an outage if both the CDN and function caches are empty.
The Retry button appears on errors and does not bypass the 24-hour cache.
Successful loads show only the title and grouped publications, without sync
metadata or a refresh button.

For local testing:

```bash
npm run preview:publications
```

Open `http://localhost:8888/publications/`. The command starts an isolated
Hugo instance on port 1314; port 8888 proxies it and executes the same function
as Netlify. The existing Hugo instance on port 1313 is unaffected and cannot
execute Netlify functions. If Node reports a local certificate trust error on macOS,
use `NODE_OPTIONS=--use-system-ca npm run preview:publications`.

HAL search is paginated, keeping the latest version per HAL identifier and
deduplicating identical DOIs (case insensitive). Dates use `producedDate_s`,
not the deposit date. Titles use the first title supplied by HAL.
HAL `ART` maps to Articles; `COMM`, `COUV` and `PROCEEDINGS` to Conferences;
`UNDEFINED` to Preprint; and `THESE`, `HDR`, `MEM` to Theses.
Reports and types outside Articles, Conferences, Preprint and Theses are excluded
from the HAL list.

Publications are sorted by year, month and day descending, then title.
Missing months or days sort after known dates within the same year or month;
no missing date values are invented for display.
The CDN TTL uses the remaining lifetime of the function's cached data so
stacked caches do not extend freshness beyond 24 hours.

### Validation

Run `npm run test:unit` for HAL normalization, chronological ordering,
pagination and cache expiry tests. `npm test` runs these tests before the
existing lint suite.

Run `npm run test:production` to build the site and verify that the optimized
CSS retains runtime author colors, badge alignment and accordion behavior.
PurgeCSS scans custom JavaScript as well as templates to preserve classes
created dynamically by the publication renderer.

## License

[The MIT license](LICENSE)
