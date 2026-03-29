# Autofix Challenges

A research platform that tests the claims made by accessibility overlay vendors — that JavaScript injected after page render can fix accessibility problems on websites, including sites the vendor does not control.

This project builds 29 intentionally inaccessible UI components in React, then applies an external JavaScript remediation layer that attempts to repair them post-render. The results document what can be fixed, what cannot, and what breaks silently.

## Why This Exists

Accessibility overlay products claim to automatically detect and repair accessibility issues using a JavaScript snippet added to a page. These claims are made to site owners who may not have the expertise to evaluate them. This project provides concrete, testable evidence for those evaluations by:

1. Building components that reproduce the **most common patterns of inaccessible UI** found in production web applications
2. Applying a **best-effort remediation layer** using the same techniques overlays use (MutationObserver, ARIA attribute injection, keyboard handler attachment)
3. Documenting the **specific failures and limitations** that emerge — not from bad implementation, but from fundamental constraints of the approach

## Components

29 components covering every major WAI-ARIA Authoring Practices pattern, with a total of **292 intentional accessibility issues**:

| Component | Route | Issues |
|-----------|-------|--------|
| Accordion | `/accordion` | 10 |
| Alert | `/alert` | 8 |
| Breadcrumb | `/breadcrumb` | 7 |
| Button | `/button` | 8 |
| Carousel | `/carousel` | 10 |
| Checkbox | `/checkbox` | 9 |
| Combobox | `/combobox` | 12 |
| Dialog (Modal) | `/modal` | 10 |
| Disclosure | `/disclosure` | 7 |
| Feed | `/feed` | 10 |
| Grid | `/grid` | 10 |
| Landmarks | `/landmarks` | 9 |
| Link | `/link` | 10 |
| Listbox | `/listbox` | 12 |
| Menu & Menubar | `/menu` | 12 |
| Menu Button | `/menubutton` | 11 |
| Meter | `/meter` | 9 |
| Multi-Thumb Slider | `/multislider` | 10 |
| Radio Group | `/radio` | 10 |
| Slider | `/slider` | 11 |
| Sortable Table | `/table` | 10 |
| Spinbutton | `/spinbutton` | 11 |
| Switch | `/switch` | 10 |
| Tab Panel | `/tabs` | 10 |
| Toolbar | `/toolbar` | 11 |
| Tooltip | `/tooltip` | 10 |
| Tree View | `/tree` | 12 |
| Treegrid | `/treegrid` | 12 |
| Window Splitter | `/splitter` | 11 |

Each component's accessibility issues are documented in a JSDoc comment at the top of its `.jsx` file. Issue categories include missing ARIA roles/states/properties, non-semantic HTML elements, absent keyboard support, and broken focus management.

## Remediation Layer

The `src/remediation/` directory contains a complete external remediation system:

```
src/remediation/
  lib/           Shared utilities
    aria.js        ARIA attribute management (roles, states, properties)
    keyboard.js    Keyboard handler attachment (Enter/Space, arrow keys)
    focus.js       Focus trapping, restoration, roving tabindex
    dom.js         DOM querying and remediation guards
    announce.js    Live region for screen reader announcements
    observer.js    MutationObserver wrappers for re-applying fixes
    tracker.js     Change tracking for full reversal on disable
  fixes/         Per-component fix modules (29 files)
  index.js       Orchestrator — enable/disable all fixes at runtime
```

The app includes a **Remediation ON/OFF toggle** in the navigation bar. When enabled, the remediation layer applies all fixes via MutationObserver. When disabled, all changes are reverted — ARIA attributes removed, event listeners detached, properties restored to original values.

Each fix module documents both the repairs attempted and the **limitations discovered**.

## Key Findings

The remediation layer encounters **23 categories of systemic failure** across the 292 issues:

**Structurally unfixable (6)** — Cannot be resolved without breaking React's DOM ownership:

- Non-semantic elements (`<div>`) cannot be replaced with semantic HTML (`<button>`, `<table>`, `<a>`, `<input>`)
- Heading hierarchy cannot be injected into accordion/landmark patterns
- `scope` attributes are invalid on non-`<th>` elements
- Color-only status indicators cannot be fixed for non-screenreader users without injecting visible DOM
- Native `<label>` click-to-focus behavior cannot be replicated via `aria-labelledby`
- `<a href>` behaviors (right-click menu, middle-click, visited state) cannot be replicated via `role="link"`

**Functionally unfixable (3)** — Interaction patterns that cannot be implemented externally:

- Type-ahead character navigation (trees, listboxes, menus)
- Overlay click-to-close on modals
- Auto-play pause control for carousels

**Unreliable / fragile (14)** — Implemented but dependent on assumptions that break silently:

- Simulated mouse events to add keyboard support to sliders/splitters (coupled to layout math and event types)
- State inferred from CSS class names (`.active`, `.open`, `.checked`, `.expanded`)
- Interactions triggered via simulated `.click()` calls
- Sort state parsed from visual Unicode characters
- All ARIA attributes stripped on every React re-render (50ms remediation gap)
- Conditional mount/unmount breaks `aria-describedby`/`aria-controls` references
- Tree level calculated from DOM nesting depth
- Values extracted from CSS inline styles
- Icon-only elements receive generic fallback labels
- 2D grid navigation requires expensive matrix rebuilding per keystroke
- Timestamp and value-text inference from visual cues
- Focus management timing on disclosure content appearance
- Live region announcement timing issues with dynamic content
- Background `inert` marking behind modals (React reconciliation conflicts, stale restoration, nested modal interference)

At the individual issue level: **36 issues (12%) cannot be fixed**, **123 issues (42%) are fixed but fragile**, and **133 issues (46%) are reasonably fixed**. Only 46% of the 292 issues are reliably remediated.

The full analysis with evidence is in [LIMITATIONS.md](./LIMITATIONS.md).

### The fundamental constraint

Post-render remediation works against the framework, not with it. React owns the DOM — it expects to be the single source of truth for element structure, attributes, and event handlers. Every fix is fighting this ownership:

1. **Attributes are ephemeral.** Re-renders erase them; fixes must continuously re-apply.
2. **Structure is immutable.** Divs cannot become semantic elements; ARIA roles are weaker substitutes.
3. **State is opaque.** Fixes reverse-engineer state from CSS classes, not application data.
4. **Events are synthetic.** Fixes simulate clicks and hope the component responds.
5. **Timing is adversarial.** There is always a gap between DOM change and fix re-application.

These are not implementation bugs. They are inherent limitations of the overlay approach.

## Getting Started

```bash
npm install
npm run dev
```

Open the dev server URL and browse the components. Use the **Remediation OFF/ON** toggle in the navigation bar to compare behavior with and without the remediation layer. Inspect elements in browser DevTools to observe ARIA attributes appear and disappear.

### Evaluating with assistive technology

For the most informative evaluation, test with:

- **Screen reader:** VoiceOver (macOS), NVDA or JAWS (Windows)
- **Keyboard only:** Navigate using Tab, arrow keys, Enter, Space, Escape
- **Browser DevTools:** Accessibility inspector to view computed ARIA attributes

Compare each component with remediation off vs. on. Note where screen reader announcements improve, where keyboard support is added, and where behavior remains broken or inconsistent.

## Project Structure

```
src/
  components/          29 intentionally inaccessible React components
    Accordion/           Accordion.jsx + Accordion.css
    Alert/               Alert.jsx + Alert.css
    ...                  (one directory per component)
  remediation/         External remediation layer
    lib/                 Shared utility modules (7 files)
    fixes/               Per-component fix modules (29 files)
    index.js             Orchestrator
  App.jsx              Router and navigation shell
  main.jsx             Entry point
LIMITATIONS.md         Detailed analysis of unfixable and unreliable issues
CLAUDE.md              Project context for AI-assisted development
```

## Tech Stack

- **React 19** with Vite
- **React Router 7** for component navigation
- No component libraries — all components hand-built to precisely control the accessibility issues
- No testing framework — the components *are* the test cases; evaluation is done via manual screen reader testing and DevTools inspection

## Related Reading

- [WAI-ARIA Authoring Practices Guide](https://www.w3.org/WAI/ARIA/apg/) — The patterns these components are based on
- [Overlay Fact Sheet](https://overlayfactsheet.com/) — Joint statement from accessibility practitioners on overlay limitations
- [WCAG 2.2](https://www.w3.org/TR/WCAG22/) — The standard these components intentionally violate
