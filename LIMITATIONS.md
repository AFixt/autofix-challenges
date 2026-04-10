# Post-Render Remediation: Unfixable and Unreliable Issues

This document catalogs what external JavaScript remediation **cannot fix**, **cannot fix reliably**, or **fixes only partially** when applied to components it does not own. These findings apply broadly to any "accessibility overlay" approach that attempts to repair inaccessible components post-render.

All 29 components in this project are covered. Each component's `.jsx` file lists its intentional issues; each fix file in `src/remediation/fixes/` documents the attempted repairs and discovered limitations.

---

## Structurally Unfixable

These issues cannot be resolved by post-render JavaScript without breaking the framework's DOM ownership or producing incorrect semantics.

### 1. Non-semantic elements cannot be replaced with semantic equivalents

**Affected:** All 29 components

Divs and spans with ARIA roles are not equivalent to their semantic HTML counterparts. Post-render remediation cannot restructure `<div>` into `<table>`, `<button>`, `<dialog>`, `<ul>/<li>`, `<input>`, `<meter>`, `<a>`, or heading elements without detaching React's event handlers and virtual DOM references, which breaks all future re-renders.

**Consequences by component:**

- **Sortable Table / Grid / Treegrid:** `role="table"` and `role="grid"` on divs are handled inconsistently by screen readers. Table/grid navigation commands (Ctrl+Alt+Arrow in JAWS/NVDA) do not work reliably. Column/row header announcement during cell navigation is unreliable or absent.
- **Accordion:** Cannot wrap triggers in real `<button>` elements inside real `<h3>` headings, violating the WAI-ARIA accordion pattern which requires both.
- **Modal Dialog:** Cannot use the native `<dialog>` element, which provides built-in focus trapping, Escape handling, and `::backdrop` styling.
- **Tree View:** Cannot use `<ul>`/`<li>` structure that screen readers use for native list navigation cues.
- **Link:** `role="link"` on a span does not provide browser address bar preview, right-click context menu, or middle-click-to-open-in-tab behavior.
- **Checkbox / Radio Group / Switch:** Cannot use native `<input type="checkbox">` or `<input type="radio">` without breaking React's controlled component pattern. Native inputs provide built-in keyboard support, form participation, and label association.
- **Slider / Multi-Thumb Slider:** Cannot use `<input type="range">`, losing native drag, keyboard, and touch interaction.
- **Spinbutton:** Cannot use `<input type="number">`, losing native increment/decrement and form validation.
- **Meter:** `role="meter"` on a div is not supported in older browser/AT combinations. The `<meter>` element provides native visual rendering and semantics.
- **Button:** `role="button"` on a div does not provide native form submission, disabled state, or context menu behavior.
- **Breadcrumb:** Cannot use `<nav>` with `<ol>`/`<li>` structure, losing native list enumeration cues.
- **Landmarks:** Cannot use `<header>`, `<nav>`, `<main>`, `<aside>`, `<footer>` — limited to ARIA role attributes, which some screen readers handle differently than native elements.
- **Feed:** Cannot use `<article>` elements, losing native article navigation cues.

### 2. Heading structure cannot be injected

**Affected:** Accordion, Landmarks

The accordion pattern requires headers (e.g., `<h3>`) wrapping trigger buttons. Post-render JS cannot insert heading elements without breaking React's reconciliation. Applying `role="heading"` and `aria-level` to the existing div conflicts with the `role="button"` needed on the same element, since an element cannot have two roles. The WAI-ARIA pattern requires a heading element *containing* a button — a nesting relationship that cannot be created by attribute changes alone.

The Landmarks component has no heading hierarchy (`<h1>`, `<h2>`, etc.) — only divs with CSS styling. The remediation applies `role="heading"` and `aria-level` to heading-like elements (`.lm-page-title`→level 1, `.lm-section-title`→level 2, `.lm-sidebar-title`→level 3), but these levels are guesses based on CSS class names — the correct levels depend on the page context which the remediation cannot know.

### 3. `scope` attributes cannot be applied to non-`<th>` elements

**Affected:** Sortable Table, Grid, Treegrid

The `scope` attribute (`col`/`row`) is only valid on `<th>` elements. Since the table/grid/treegrid use divs, there is no way to establish the header/cell relationship that `scope` provides. ARIA alternatives (`aria-colindex`, `aria-rowindex`) are partial substitutes but require mapping indices to a data model the remediation layer does not have access to.

### 4. Color-only indicators cannot be fully remediated

**Affected:** Sortable Table, Grid, Meter, Alert, Carousel

Status badges, priority dots, meter colors, and alert type indicators use color (or color plus ambiguous Unicode symbols) to differentiate states. The remediation adds `aria-label` text for screen reader users (e.g., Grid priority dots, Alert type icons, Sortable Table status badges, Carousel dots), but this does **not** help sighted users with color vision deficiency who do not use a screen reader. Fully fixing this requires injecting visible icons, patterns, or text — DOM changes that would break React's rendering. Additionally, the labels are inferred from CSS class names (e.g., `.priority-high`, `.alert-error`), so they break silently if classes change.

### 5. Native `<label>` click-to-focus cannot be replicated

**Affected:** Modal Dialog, Checkbox, Radio Group, Switch, Combobox, Slider, Multi-Thumb Slider, Spinbutton

Input fields and custom controls are labeled via `aria-labelledby` pointing to `<div>` elements. This works for screen readers but does not provide click-to-focus behavior — clicking the label text does not focus the associated control, unlike a native `<label for="...">` element.

### 6. Link behavior cannot be fully replicated with `role="link"`

**Affected:** Link, Breadcrumb

Span-based links made keyboard-focusable with `tabindex="0"` can be given `role="link"` to announce as links, but they lack:

- Browser address bar URL preview on hover/focus
- Right-click context menu (open in new tab, copy link, etc.)
- Middle-click to open in new tab
- Visited link styling (`:visited` pseudo-class)
- Drag-to-bookmarks-bar behavior
- Download attribute functionality

These are native `<a href>` behaviors that cannot be replicated via ARIA.

---

## Functionally Unfixable

These interaction patterns cannot be reliably implemented from outside the component.

### 7. Type-ahead character navigation

**Affected:** Tree View, Treegrid, Listbox, Combobox, Menu & Menubar

The WAI-ARIA patterns for trees, listboxes, menus, and comboboxes recommend type-ahead: pressing character keys should move focus to the next item whose label starts with that character. Implementing this externally requires:

- Indexing all visible item labels on every DOM mutation
- Maintaining a multi-keystroke buffer with timeout
- Handling interaction between type-ahead and expand/collapse state changes
- Re-indexing after React re-renders destroy and recreate nodes

This is prohibitively complex to maintain from outside the component.

### 8. Overlay click-to-close on the Modal Dialog

**Affected:** Modal Dialog

Clicking the overlay backdrop should close the modal. Adding a click listener externally would fire on all clicks including those inside the modal (event bubbling), and stopping propagation would interfere with React's synthetic event system.

### 9. Auto-play pause control for Carousel

**Affected:** Carousel

The carousel auto-rotates with no pause control. Adding a pause button requires injecting a new DOM element and managing React state — both impossible from outside. The WCAG requirement is that auto-playing content must be pausable, stoppable, or hideable. The remediation can add `aria-live` to announce slides, but this makes auto-play *noisier*, not better. The component should pause on focus, which cannot be enforced via attribute remediation.

---

## Unreliable Fixes (Fragile by Nature)

These are technically implemented but depend on assumptions that can silently break.

### 10. Simulated mouse events for keyboard interaction

**Affected:** Slider, Multi-Thumb Slider, Spinbutton, Window Splitter

When components lack keyboard handlers, the remediation simulates mouse events to trigger the component's existing mouse-based interaction handlers. For sliders and the window splitter, this means dispatching `mousedown`/`mousemove`/`mouseup` events at calculated pixel positions corresponding to the desired value. For the spinbutton, the increment/decrement buttons are clicked programmatically.

This successfully updates React state (unlike the previous approach of dispatching custom events that were silently ignored), but it is fragile:

- The pixel position calculation is coupled to the component's layout and bounding rectangle math — if the track/container is not yet laid out or has zero width, the calculation produces incorrect values
- If the component switches from `mousedown` to `pointerdown`, the simulation stops working silently
- Multi-step spinbutton changes (Page Up/Down, Home/End) require multiple sequential `.click()` calls, which may cause visual jitter or be batched unexpectedly by React
- The simulated events bypass the browser's trusted event chain — some components may check `event.isTrusted` and reject synthetic events

### 11. State detection via CSS class names

**Affected:** All components with toggleable/selectable state

Every fix infers component state by reading CSS classes:

| Component | Class | State inferred |
|-----------|-------|---------------|
| Tab Panel | `.active` | Selected tab |
| Accordion | `.open` | Expanded section |
| Tree View | `.expanded` | Expanded node |
| Modal Dialog (internal toggle) | `.active` | Toggle switch on/off |
| Checkbox | `.checked`, `.mixed` | Checked/indeterminate |
| Radio Group | `.selected` | Selected option |
| Switch | `.on` | On/off state |
| Button | `.pressed` | Toggle pressed |
| Toolbar | `.active` | Toggle pressed |
| Carousel | `.active` | Current dot |
| Combobox | `.highlighted`, `.selected` | Active option |
| Listbox | `.selected` | Selected option |
| Disclosure | DOM presence | Expanded content |
| Treegrid | `.open` (on chevron) | Expanded row |
| Alert | `.alert-success`, `.alert-error`, etc. | Alert type |
| Grid | `.priority-high`, `.priority-low`, etc. | Priority level |

If any component is refactored to use different class names, inline styles, CSS-in-JS, or data attributes, the fix breaks silently — ARIA attributes will report incorrect state.

### 12. Interaction via simulated clicks

**Affected:** Tab Panel, Accordion, Tree View, Treegrid, Listbox, Menu & Menubar, Menu Button, Carousel, Radio Group, Disclosure, Link, Switch, Modal Dialog

Arrow key navigation and keyboard activation work by calling `.click()` on DOM elements, relying on React's onClick handler to update state. This breaks if:

- React uses event delegation and the handler is on a parent, not the element
- The component switches to `onPointerDown` or another event type
- React's synthetic event system changes its delegation strategy
- The component adds `preventDefault` or `stopPropagation`

### 13. Sort state parsed from visual characters

**Affected:** Sortable Table

The fix reads `↑`, `↓`, `↕` characters from DOM text to determine sort direction. This breaks if the component changes to SVG icons, CSS pseudo-elements, or different characters.

### 14. All ARIA attributes stripped on re-render

**Affected:** All 29 components

React re-renders replace DOM nodes or reset attributes to match the virtual DOM, which does not include the remediation's ARIA additions. The MutationObserver re-applies fixes after each mutation, but:

- There is a 50ms debounce window where the component is un-remediated
- During this window, screen readers may announce incorrect or missing information
- Rapid interactions produce announcement gaps
- React batch updates may cause the observer to fire mid-batch with inconsistent DOM

### 15. Conditional rendering breaks ARIA references

**Affected:** Tooltip, Disclosure, Combobox, Listbox, Menu & Menubar, Menu Button, Modal Dialog

When React conditionally renders content (mount/unmount rather than show/hide), ARIA reference attributes break:

- `aria-describedby` pointing to a tooltip that has been unmounted references nothing
- `aria-controls` pointing to a collapsed panel that has been removed from the DOM is invalid
- `aria-activedescendant` referencing a dropdown option that no longer exists causes screen reader confusion

The fix sets these attributes when content appears, but there is always a timing gap between content rendering and attribute application.

### 16. DOM nesting depth used to calculate tree levels

**Affected:** Tree View, Treegrid

Tree depth is calculated by walking up the DOM counting wrapper elements. This couples the fix to the exact nesting structure. A refactor that flattens the DOM (virtual scrolling, CSS-grid-based layout) produces incorrect `aria-level` values.

### 17. Value extraction from CSS inline styles

**Affected:** Meter, Slider, Multi-Thumb Slider, Window Splitter

Values are inferred from computed CSS properties:

- **Meter:** `aria-valuenow` parsed from the `width` percentage of `.meter-bar-fill`
- **Slider/Multi-Thumb:** Thumb position from `style.left` percentage
- **Splitter:** Panel width as percentage of container

If width is set via classes, CSS variables, transforms, or any method other than inline `width`/`left` styles, extraction fails silently and values default to 0 or are omitted entirely.

### 18. Label extraction for icon-only elements

**Affected:** Button, Toolbar, Menu Button, Tooltip, Link, Carousel

Icon-only buttons and image links have no text content. The fix attempts to derive labels from `title`, `data-label`, `alt` attributes, or emoji/text content. When none exist, generic fallbacks like "Button", "Menu", "Link" are used — providing technically compliant but unhelpful labels. Toolbar icon detection uses a Unicode/emoji regex pattern that may misclassify short text labels as icons.

### 19. Two-dimensional navigation matrix cost

**Affected:** Grid, Treegrid

Cell-by-cell arrow key navigation requires building a row/column matrix from the DOM on every keystroke and every re-render. This is O(rows × columns) per operation. In large grids, this adds perceptible latency. React may also reorder cells during state changes, causing the matrix to be inconsistent for the duration of a render cycle.

### 20. Timestamp and value-text inference

**Affected:** Feed, Meter

Human-readable text is inferred from visual cues:

- **Feed:** Shorthand timestamps (e.g., "2h", "4d") are expanded to "2 hours ago", "4 days ago" via regex matching. Non-standard formats are left unchanged and may be confusing.
- **Meter:** Status levels ("low", "medium", "high", "critical") are appended to `aria-valuetext` based on generic percentage thresholds (25/50/75%). These thresholds are guesses — "89% CPU usage" is critical, but "89% password strength" is not.

Both rely on assumptions about how the component formats its display values. If the format changes, the inference produces incorrect or misleading accessible text.

### 21. Focus management on content appearance

**Affected:** Disclosure

When a disclosure panel is expanded, the remediation moves focus into the revealed content so keyboard users know new content has appeared. This uses `requestAnimationFrame` to wait for React to render the panel, which is inherently timing-dependent — on slow devices the panel may not yet be in the DOM when focus is attempted, causing a silent failure. Additionally, moving focus on expand but not on collapse creates an asymmetric interaction that may surprise some users.

### 22. Screen reader announcement timing

**Affected:** Alert, Carousel, Feed, Sortable Table

Dynamic announcements via `aria-live` regions have timing constraints:

- **Alert:** `aria-live="assertive"` on dynamically added `role="alert"` nodes may be missed by VoiceOver if the live region did not exist before content was inserted
- **Carousel:** `aria-live="polite"` announces every auto-play slide change, making the component noisy for screen reader users
- **Feed:** `aria-setsize` set to `-1` (unknown) for lazy-loaded feeds; screen readers cannot tell users how many items exist
- **Sortable Table:** Sort announcement uses double `requestAnimationFrame` to wait for React to update DOM — fragile timing that may miss on slow devices

### 23. Background content is not hidden from screen readers

**Affected:** Modal Dialog

When the modal is open, background content should be marked `inert` or `aria-hidden="true"` to prevent screen reader users from navigating behind the modal. The fix sets `aria-modal="true"` on the dialog container, which signals to screen readers that they should restrict navigation to the modal. However, `aria-modal` support is inconsistent — older browser/AT combinations ignore it entirely, allowing users to navigate into background content.

The more robust approach would be to walk up from the modal to `<body>`, marking all sibling branches as `inert`, then reverse on close. This was not implemented because doing it externally is prohibitively fragile:

- **React reconciliation conflicts:** React owns the DOM. If React re-renders a subtree that has been marked `inert`, it may remove the attribute. A MutationObserver can re-apply it, but this creates a race condition and adds runtime overhead.
- **Modal placement is unpredictable:** If the modal is deeply nested (rather than portaled to `<body>`), the tree-walk must navigate a complex structure. If React moves the modal in the DOM during a re-render, the inert markers may hide the modal itself or miss new content.
- **Stale restoration:** The original state must be restored on close. If the DOM changed while the modal was open (async content loaded, route change, dynamic insertions), the saved state is stale and elements may be left permanently inert.
- **Multiple modals / nested dialogs:** If another script opens a second modal, or if elements already have `aria-hidden` for other reasons, blindly toggling these attributes can break other components.

The fix therefore relies on `aria-modal="true"` combined with keyboard focus trapping, which is incomplete — screen reader virtual cursor navigation can still escape the modal in browsers/AT that do not honor `aria-modal`.

---

## Summary

| Category | Count | Issues |
|----------|-------|--------|
| Structurally unfixable | 6 | Semantic elements, headings, scope, color-only indicators, label click-to-focus, link behavior |
| Functionally unfixable | 3 | Type-ahead, overlay close, auto-play pause |
| Unreliable / fragile | 14 | Simulated mouse events, class detection, simulated clicks, character parsing, re-render stripping, conditional rendering, nesting depth, CSS value extraction, icon labels, 2D navigation cost, timestamp/value inference, disclosure focus management, announcement timing, background inert marking |
| **Total** | **23** | |

Across all 29 components, there are **292 intentional accessibility issues**. Of these, the 23 categories above represent systemic problems that affect most or all components.

### Issue-level breakdown

Mapping each of the 292 individual issues to the categories above:

| Outcome | Issues | % | Description |
|---------|--------|---|-------------|
| Cannot be fixed | 36 | 12% | Blocked by structural or functional constraints — no post-render approach can resolve these |
| Fixed but fragile | 123 | 42% | Technically implemented but dependent on CSS class names, simulated events, layout math, or timing that can break silently |
| Reasonably fixed | 133 | 46% | ARIA attributes, tabindex, keyboard handlers, and labels that work reliably within the post-render constraint model |

**Only 46% of issues are reliably remediated.** The remaining 54% are either impossible to fix (12%) or depend on assumptions that break silently when the component is refactored, restyled, or re-rendered (42%). The fixes that *do* work require continuous re-application via MutationObserver, adding runtime overhead and an inherent brittleness that does not exist when accessibility is built into the component source.

### The fundamental constraint

Post-render remediation is working against the framework, not with it. React (and similar frameworks) own the DOM — they expect to be the single source of truth for element structure, attributes, and event handlers. Every remediation fix is fighting this ownership model:

1. **Attributes are ephemeral.** React re-renders erase them. The fix must continuously re-apply.
2. **Structure is immutable.** Divs cannot become semantic elements. ARIA roles are the only option, and they are weaker substitutes.
3. **State is opaque.** The fix cannot read React state; it must reverse-engineer state from CSS classes and DOM structure.
4. **Events are synthetic.** The fix cannot trigger React state updates directly; it must simulate clicks and hope the component responds.
5. **Timing is adversarial.** There is always a gap between a DOM change and the fix re-applying, during which assistive technology sees stale or missing information.

These problems are compounded when content changes asynchronously (XHR responses, WebSocket updates, polling). The remediation layer has no awareness of pending data fetches — it can only react after the DOM has already changed, widening the gap during which assistive technology sees un-remediated content. User-initiated changes at least follow a predictable interaction→render cycle; server-driven updates arrive at arbitrary times, making the MutationObserver's debounce window a more frequent source of stale or missing announcements.

These are not implementation bugs — they are inherent limitations of the overlay approach. No amount of engineering can fully overcome them.
