# TODO

| Step | Status | Task                                                                                                                                                                                                                  |
| ---- | ------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1.1  | done   | Inspect project, verify NASA source, document product and contracts.                                                                                                                                                  |
| 1.2  | done   | Pinned stack installed successfully with npm.                                                                                                                                                                         |
| 2.1  | done   | Processing and replay pass normalization/cluster tests.                                                                                                                                                               |
| 2.2  | done   | API ingestion, auth, review persistence and area validation pass integration tests.                                                                                                                                   |
| 3.1  | done   | Responsive workspace, live map, filters, evidence drawer and review workflow.                                                                                                                                         |
| 3.2  | done   | Analytics, saved areas, source health, protected connection and CSV/GeoJSON exports.                                                                                                                                  |
| 4.1  | done   | Seven tests pass; lint/build pass; real NOAA-20/21/S-NPP feeds verified; desktop/mobile browser workflow, reload persistence and exports pass.                                                                        |
| 4.2  | done   | Fixed basemap, formatted active code, verified dev/production starts, removed synthetic QA decisions, documented setup and limitations.                                                                               |
| 5.1  | done   | Pages replay adapter, local reviews/areas and `/ThermalGuard/` build pass mirrored subpath testing.                                                                                                                  |
| 5.2  | done   | Source pushed to `main`; deployment-only compiled output pushed to `gh-pages` in sankirtansyadavofficial-Hack/ThermalGuard.                                                                                                            |
| 5.3  | done   | Public URL returns 200; hosted replay, assets, review persistence and mobile layout verified without browser errors.                                                                                                  |
| 6.1  | done   | Earth/district scope documented; sankirtansyadavofficial-Hack account ID 160756912 verified.                                                                                                                                          |
| 6.2  | done   | Lazy 3D Earth with drag/zoom/keyboard/rotation, district cards, accessible demo login, session and workspace integration.                                                                                             |
| 6.3  | done   | Seven API tests, lint, both production builds, NASA-backed browser smoke and full desktop/mobile Earth workflow pass; screenshots visually inspected.                                                                 |
| 6.4  | done   | Published source/main and compiled/gh-pages to sankirtansyadavofficial-Hack/ThermalGuard; HTTP 200, hosted browser checks and sole user contributor verified.                                                                        |
| 7.1  | done   | Located supplied previous index page and assessed its realistic texture treatment, controls and fallbacks.                                                                                                            |
| 7.2  | done   | Integrated the supplied prior index-page Earth day/night/cloud/terrain/water treatment with local fallback; build, full browser workflow and visual QA pass.                                                          |
| 7.3  | done   | Restored oversized Earth, dense stars and automatic rotation with drag/resume, pause and reduced motion; build, lint, seven tests and full district/browser checks pass.                                              |
| 8.1  | done   | Interactive feature explanations, satellite walkthrough, priority calculator and backend/API explorer; hover/focus/touch, keyboard, boundary cases, responsive layouts and existing Earth/district workflow verified. |

## Latest completion

- 9.1 — done: pointer-follow Earth parallax, linked lighting, intro entrance and offscreen rendering suspension. Build/lint, full Earth/district workflow and pointer-specific checks pass, including raycast picking of visibly shifted markers, drag precedence, pause, neutral return, reduced motion and touch. Browser check: `node tests/earth-pointer-browser.mjs` (uses `EARTH_TEST_URL` or the port 4182 Pages preview).

## Handoff (10 September 2026)

- Production app: http://127.0.0.1:4173. Vite build: `dist/`. Start with `npm start`, or `npm run dev` for HMR.
- NASA checks: NOAA-20 24h returned 294 detections / 244 grouped events; NOAA-21 567 / 488; S-NPP 496 / 420. NOAA-20 7d returned 2595 / 2070. Counts are retrieval-specific, not permanent app statistics.
- Optional OSM context endpoint timed out during live verification (both main and separately checked alternate provider). Failure state works. No context data or facility claims were fabricated.
- Optional FIRMS MAP_KEY branch covered by mocked API tests; no real private key was supplied. Public NASA path verified end to end.
- Trained classifier, independent accuracy validation, long-term facility baselines, full satellite/land-cover fusion, verified user roles and emergency operations remain explicitly out of this prototype scope.
- No SIH win claim. Public deployment was completed in phase 5 and is updated in phase 6.

## GitHub Pages deployment (10 September 2026)

- Source repository: https://github.com/sankirtansyadavofficial-Hack/ThermalGuard on `main`.
- Public presentation build: https://sankirtansyadavofficial-hack.github.io/ThermalGuard/ from `gh-pages` root.
- Public browser verification passed with correct `/ThermalGuard/` assets, zero JavaScript/request failures, browser-local review persistence and no mobile horizontal overflow.
- GitHub Pages cannot run Node/SQLite. The public build therefore disables Live mode and labels the fixed replay as synthetic. The local Node build remains the actual NASA-connected prototype.

## Earth explorer deployment (10 September 2026)

- Current repository: https://github.com/sankirtansyadavofficial-Hack/ThermalGuard. Current public URL: https://sankirtansyadavofficial-hack.github.io/ThermalGuard/.
- Source snapshot 2421f35 and initial deployment 429826b use Sankirtans Yadav's verified `160756912+sankirtansyadavofficial-Hack@users.noreply.github.com` identity. GitHub reports author/committer sankirtansyadavofficial-Hack and sankirtansyadavofficial-Hack as the sole contributor. No automated coauthor trailers.
- New initially empty repository uses a clean root snapshot. Previous history is preserved locally on `main` and `codex/earth-district`, plus the original remotes `sankirtansyadav-origin` and `previous-origin`. Nothing was force-pushed or rewritten on those repositories.
- Current working branch `codex/sankirtansyadavofficial-hack-publish` tracks `origin/main`; publish future source commits with `git push origin HEAD:main`, then `npm run deploy:pages` for the website.
- Public and mirrored-subpath tests verified rendered Earth, mouse drag, wheel zoom, keyboard controls, rotation/reset, raycast marker selection, district cards, invalid/valid PIN, evidence review, reload persistence, sign-out, guest entry and mobile layout. WebGL-unavailable fallback still opens the district workspace. No uncaught browser errors.
- Demo manager PIN is publicly documented as 2026. District extents are approximate, role simulation is not real authentication, and hosted data remains visibly synthetic with browser-local decisions.
- Seven API tests, lint, both builds and the real NASA-backed browser smoke pass. Three.js loads in a separate ~140 KB gzip chunk only when Earth is needed; Vite flags its uncompressed size as a non-failing bundle advisory.
