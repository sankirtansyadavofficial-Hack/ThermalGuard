# ThermalGuard prototype

## Purpose

Deliver CompileX's SIH26162 idea as a working Vite application: inspect NASA thermal detections, prioritize evidence for human review, and preserve analyst decisions. This application scope supersedes the parent workbook project's exclusion of prototype development.

## Features and acceptance

- Real NASA FIRMS NOAA-20, NOAA-21 and S-NPP public South Asia CSV ingestion, 24h/48h/7d windows. Optional server-only FIRMS MAP_KEY enables the area API for up to five days.
- Map and review queue with geographic extent, sensor, confidence, FRP and review filters. India means a rectangular extent, not an administrative boundary.
- Deterministic deduplication, 1 km/24h event clustering and explainable rule-based review priority. Source classification remains uncertain until an analyst reviews it. No fabricated AI probabilities.
- Detail workspace with actual observations, FRP sequence, optional on-demand OSM context, source lineage and explicit missing evidence.
- Confirm/reject/defer review with classification, rationale and SQLite audit history. Saved areas persist. CSV and GeoJSON exports preserve provenance and decisions.
- Source health, refresh/cache age, retrieval errors, empty states and an explicit synthetic replay for presentations. Never silently replace live data with invented data.
- Responsive professional dark geospatial UI, keyboard controls, legible contrast and reduced motion.
- Local prototype launches with one command; production build runs with the Node API server. Tests exercise processing, API validation and persistence.
- GitHub Pages publishes a browser-only presentation build under `/ThermalGuard/`. It uses the explicit synthetic replay and browser-local reviews/areas because Pages cannot run Node/SQLite and NASA public CSV blocks browser CORS. The hosted UI must never label replay as live satellite data.

## Constraints

Landing education: add accessible hover/focus/tap feature explanations, a selectable five-stage satellite-to-review walkthrough, an illustrative FRP/confidence priority calculator using the existing rules, and a backend explorer distinguishing the hosted replay from the Node/NASA deployment. Describe satellite limitations and link official NASA references. Preserve the Earth, district login and all workspace functions; add no new data sources, authentication or detection claims.

Near-real-time detections are not continuous surveillance or verified incidents. Rule priority is not fire probability. A trained six-class model, calibrated accuracy, ground truth, dispatch and national deployment are outside this iteration. No guarantee of SIH selection. Keys stay server-side.

## Interactive Earth and district demonstration

The index opens an interactive 3D Earth with drag, scroll/pinch zoom, keyboard controls, reset, rotation toggle and selectable district pilot locations. These locations are illustrative coverage presets, not live incident markers. Earth is navigational context, not Google imagery or street-level mapping. The landing globe applies the prior index-page visual treatment - realistic Earth day, night-light, cloud, terrain and water textures - when its public texture mirrors load; it falls back to the bundled Natural Earth cartography without losing controls or district selection. A labelled demo manager login uses public PIN 2026 and a selected district; it is session-only role simulation, never authentication. Four pilot areas (Jamnagar, Ahmedabad, Ludhiana, Dhanbad) use approximate bounding boxes, not official boundaries. Manager sessions start in their selected area, retain all evidence/review/export workflows and can explore other areas. Guest exploration remains available. Publish source and gh-pages to sankirtansyadavofficial-Hack/ThermalGuard under the user's verified GitHub identity without automated coauthor trailers; preserve the previous repository history separately.

## Success

Pointer-responsive hero: on fine-pointer devices, moving the mouse across the opening section gently changes the Earth viewing angle and screen position with damped parallax and linked blue lighting. Dragging takes priority, wheel/pinch zoom and marker selection remain accurate, and leaving the hero eases back to neutral. Pause freezes ambient pointer motion; focus/keyboard navigation resets it. Disable the decorative motion for reduced-motion and touch-only users. Preserve all landing education and workspace features.

The opening view restores the supplied original's oversized blue Earth, dense star field and atmospheric lighting while retaining the current landing content and district/workspace features. Rotation starts automatically, pauses during dragging, resumes after 1.2 seconds of inactivity, and obeys the explicit pause button and reduced-motion preference.

Build and tests pass; a real NASA request populates the map; review survives reload; exports and filters work; desktop/mobile layouts are inspected. External outages are clearly surfaced with timestamped cached data when available.
