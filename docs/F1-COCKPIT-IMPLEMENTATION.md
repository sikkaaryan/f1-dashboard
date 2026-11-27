# F1 Cockpit — iPhone 11 Pro Implementation Plan

## Locked product decisions

- Device: iPhone 11 Pro (5.8-inch OLED)
- Primary orientation: landscape
- Usage: both standby display and interactive F1 information app
- Visual direction: technical motorsport HUD
- Backgrounds: dynamic-switch — rotate between restrained motion graphics and curated racing/circuit imagery, with a static fallback
- Clock: analog clock is the primary time display; retain a compact digital time/seconds readout for precision
- Information density: clean home screen; deeper information belongs on dedicated screens
- Existing repository: Next.js 15.5.24, React 19.1, TypeScript, deployed through Vercel
- Existing data integrations: OpenF1 and Open-Meteo

## Product principles

1. Landscape-first, designed against the iPhone 11 Pro CSS viewport (approximately 812 × 375 CSS px in landscape at default scale), while adapting to safe areas and browser chrome.
2. Standby is a real operating mode, not a separate product: it shows the clean home composition, hides navigation chrome when idle, and reveals controls on interaction.
3. No invented live data. Every data panel must have loading, unavailable, stale, and error states.
4. Keep animation restrained and battery-conscious. Prefer CSS transforms/opacity and static fallbacks; do not autoplay heavy video as the default.
5. Preserve current working API functionality where practical, but refactor it into reusable data hooks/adapters rather than leaving all logic in one page component.
6. PWA installation is supported, but iOS does not guarantee a true always-on display or prevent device auto-lock in every circumstance. Explain and test the practical keep-awake behaviour on device.

## Information architecture

### 1. Home / Cockpit
- Primary analog clock with second hand and compact digital seconds
- Day and date
- Next Grand Prix name, round and local countdown
- Current session state when a session is active
- Compact weather summary for the configured location (Delhi default; location configurable later)
- Optional small top-driver preview, limited to avoid crowding
- Rotating ambient background layer
- Small status row for data freshness / connectivity

### 2. Standings
- Drivers and constructors tabs
- Position, driver/team, points and team colour
- Highlight leader and latest position changes only when source data supports them
- Season selector only if the API provides the required season data

### 3. Schedule
- Upcoming, current-weekend and completed sessions
- Session names and times converted to Asia/Kolkata
- Clear live / next / completed status
- Race weekend detail view

### 4. Circuit
- Circuit outline/map where a verified asset or supported data is available
- Location, length, turns, laps, DRS zones and lap record only when sourced
- Avoid placeholder metrics presented as facts

### 5. Live
- Session status and timing tower when OpenF1 exposes live session data
- Position, driver, lap time and gap where returned
- Explicit “No live session” state outside sessions
- Graceful handling of API limits, missing timing data and session transitions

### 6. Settings
- Standby mode toggle
- Background mode: auto / motion graphics / still imagery
- Animation intensity: low / standard
- Clock seconds visibility
- Weather location
- Data refresh information
- Display wake guidance for iOS
- Reset preferences

## Interaction model

- Landscape tab navigation: Home, Standings, Schedule, Circuit, Live, Settings
- Horizontal swipe between primary sections, without blocking vertical scroll in lists
- Standby mode hides navigation after a short idle period; a tap reveals it
- Tapping the home race card opens Schedule; tapping standings preview opens Standings
- Respect prefers-reduced-motion
- Keep touch targets comfortable for the small landscape viewport

## Visual system

- Base: near-black / graphite, subtle carbon texture
- Accent: racing red, used for active state, live indicators and critical emphasis
- Secondary: cool white and muted grey
- Typography: condensed motorsport-style headings paired with highly legible numeric/data typography
- Panels: thin borders, restrained glass/gradient surfaces, clear hierarchy
- Avoid excessive glow, tiny text and dense tables on Home

## Technical implementation plan

### Phase 1 — Foundation and shell
- Introduce shared app shell, navigation and design tokens
- Establish landscape iPhone layout and safe-area handling
- Add screen-level components and responsive breakpoints
- Preserve existing metadata and PWA setup; verify manifest and icons

### Phase 2 — Cockpit home and standby
- Extract clock, date, weather and next-race logic into focused hooks/utilities
- Build analog clock with accessible digital time
- Implement dynamic-switch background controller with still fallback
- Add idle/standby interaction and reduced-motion support

### Phase 3 — F1 information screens
- Extract OpenF1 requests into typed service modules
- Add Standings, Schedule, Circuit and Live screens
- Add loading/error/empty/stale states
- Verify every displayed statistic against returned API fields

### Phase 4 — Preferences and PWA polish
- Persist user settings locally
- Add configurable background and animation settings
- Review install flow, standalone mode, landscape presentation and iOS limitations
- Add keep-awake behaviour only where browser support allows, with a clear fallback

### Phase 5 — Device QA and deployment
- Test at iPhone 11 Pro landscape CSS dimensions and safe areas
- Test portrait fallback, rotation, touch navigation and Home Screen standalone mode
- Test offline/slow network/API failure states
- Check battery/performance impact of animation and refresh intervals
- Run TypeScript, lint (if configured) and production build
- Deploy through the existing Vercel project after validation

## Acceptance criteria

- Home is legible at iPhone 11 Pro landscape size without horizontal scrolling.
- Analog clock updates smoothly and digital seconds remain accurate.
- Home remains visually calm and uncluttered; detailed tables are on their own screens.
- Backgrounds rotate only among available assets/effects and always have a static fallback.
- All live/schedule/standings values are source-backed; no sample values appear as live facts.
- Standby mode reveals navigation on tap and respects reduced-motion preferences.
- PWA can be added to the iPhone Home Screen and behaves correctly in standalone mode where iOS supports it.
- Existing weather and schedule integrations continue to fail gracefully.

## Current repository observations

- The existing app is concentrated in `app/page.tsx` and `app/globals.css`.
- Current code already fetches 2026 OpenF1 meetings/sessions, derives next-session/race information, fetches championship drivers, and retrieves Delhi weather from Open-Meteo.
- The existing manifest declares landscape orientation.
- The current package uses Next.js 15.5.24, React 19.1.0 and TypeScript 5; no animation library is currently listed.
- The current page is a single large client component; the redesign should split UI and data concerns into components/modules before adding more features.

## Implementation guardrails

- Do not replace the current app with static mock data.
- Do not hard-code a specific Grand Prix, round, driver order, points total, circuit metrics or countdown.
- Do not add a new dependency unless it materially improves the implementation; CSS is sufficient for the initial motion system.
- Do not assume iOS can keep the display awake indefinitely.
- Keep changes on the feature branch until device testing and review are complete.
