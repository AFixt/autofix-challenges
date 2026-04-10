# Post-Render Remediation Limitations Across Frameworks

This document extends the findings in [LIMITATIONS.md](LIMITATIONS.md) — which are based on React — to Angular, Vue, Svelte, and other component-based UI frameworks. The core conclusion is the same: **the limitations are inherent to the overlay approach, not specific to React.** Every framework that owns the DOM introduces the same categories of conflict. The details differ in ways that sometimes make things harder, sometimes easier, but never fundamentally solvable.

---

## The shared constraint model

All modern component-based frameworks share five properties that make external remediation unreliable:

1. **The framework owns the DOM.** Components produce DOM as output. The framework expects to be the sole writer of element structure and attributes within its mount point.
2. **State is internal.** Component state lives in JavaScript objects the framework manages. It is not readable from the DOM without reverse-engineering visual cues.
3. **Rendering is asynchronous.** Updates are batched, scheduled, or deferred. There is always a window between a state change and its DOM expression.
4. **Event systems are abstracted.** Frameworks intercept, delegate, or synthesize events. External event dispatch may not reach the handlers that update state.
5. **Structure is template-driven.** The DOM shape is declared in templates or JSX. External structural changes are overwritten on the next render cycle.

These properties hold for React, Angular, Vue, Svelte, Lit, Solid, Qwik, and any framework built on the component model. The specific mechanisms differ — and those differences affect the severity of individual limitations — but none of them eliminate the fundamental constraints.

---

## Framework-specific analysis

### Angular

Angular's architecture introduces additional challenges beyond those found in React:

**Change detection is more aggressive.** Angular's Zone.js patches all asynchronous APIs (setTimeout, Promise, addEventListener, XHR) to trigger change detection automatically. Any external event listener added by a remediation layer — keydown handlers, click handlers, MutationObserver callbacks — will trigger Angular's change detection cycle, which may re-render components and strip remediation attributes even when no relevant state changed. This makes the "ARIA attributes stripped on re-render" problem (Limitation #14) worse than in React, where re-renders are more targeted.

**Two-way binding obscures state further.** Angular's `[(ngModel)]` and reactive forms create bidirectional data flow. The remediation layer cannot determine whether a DOM change was caused by user input, programmatic state update, or form validation — all three produce identical DOM mutations. Inferring state from CSS classes (Limitation #11) is equally fragile, but the additional sources of mutation increase the frequency of stale reads.

**ViewEncapsulation complicates selectors.** Angular's default `Emulated` view encapsulation rewrites CSS selectors by appending auto-generated `_ngcontent-*` and `_nghost-*` attributes. Component-internal class names like `.active` or `.selected` are scoped. A remediation layer querying `.active` may miss elements if the selector needs the encapsulation attribute, or may match elements in unrelated components if querying globally. `ShadowDom` encapsulation (discussed below) makes external access impossible entirely.

**Ahead-of-Time compilation removes template metadata.** In production builds, Angular's AOT compiler strips template metadata and generates optimized render functions. The component's template structure — which might provide hints about intended semantics — is not inspectable at runtime. The remediation layer has only the rendered DOM to work with, same as React, but with even less ability to introspect intent.

**Simulated events face stricter delegation.** Angular uses its own event binding system (`(click)="handler()"`) compiled into the component's change detection tree. Dispatching synthetic `click` or `mousedown` events from outside the component may trigger the DOM event but will not necessarily trigger Angular's change detection unless Zone.js intercepts it. Events dispatched via `new Event()` with `bubbles: true` generally work, but `new CustomEvent()` or events on elements outside the Angular zone may be ignored.

**Structural directives destroy and recreate DOM.** `*ngIf`, `*ngFor`, and `*ngSwitch` remove and re-insert DOM subtrees rather than hiding them. This is identical to React's conditional rendering (Limitation #15) — ARIA reference IDs become dangling when the referenced element is destroyed. Angular's `@defer` blocks (introduced in v17) add lazy-loaded template fragments that appear asynchronously, widening the timing gap.

### Vue

Vue's reactivity system creates a different flavor of the same problems:

**Reactivity is proxy-based and invisible.** Vue 3's Composition API wraps state in `Proxy` objects. Component state changes propagate through a dependency-tracking graph that has no DOM representation until the next render flush. The remediation layer cannot subscribe to state changes — it can only observe their DOM consequences after the fact, via MutationObserver with the same debounce gap (Limitation #14).

**Virtual DOM patching is keyed.** Vue's `v-for` directive uses `:key` attributes to match DOM nodes across re-renders. If Vue decides a node's key has changed, it destroys the old node and creates a new one rather than updating in place. All remediation attributes, tabindex changes, and event listeners attached to the old node are lost. This is functionally identical to React's reconciliation behavior but occurs more frequently in list-heavy components because Vue's diffing algorithm is more aggressive about node replacement when keys change.

**Transition system interacts with remediation.** Vue's `<Transition>` and `<TransitionGroup>` components temporarily add and remove CSS classes (`v-enter-active`, `v-leave-to`, etc.) during animations. A remediation layer detecting state from CSS classes (Limitation #11) may misread transitional classes as component state — an element entering the DOM has `v-enter-from` which does not indicate the final visual state.

**Template refs are private.** Vue components expose child elements via `ref` attributes, but these are only accessible within the component's setup function. The remediation layer cannot use template refs to reliably locate elements — it must rely on CSS selectors, which break when class names or structure change.

**`v-show` vs `v-if` affects ARIA references differently.** `v-show` toggles `display: none` (element stays in DOM), while `v-if` removes the element entirely. The remediation layer cannot predict which directive was used — it can only observe the result. ARIA references (aria-controls, aria-describedby) break under `v-if` but survive under `v-show` (Limitation #15). Since the directive choice is invisible from outside, the remediation cannot reliably set references that will survive state changes.

**Scoped styles share Angular's encapsulation problem.** Vue's `<style scoped>` adds auto-generated `data-v-*` attributes. Class-based state detection works within those scoped selectors, but the attribute suffix is generated at build time and changes across builds. Hardcoding selectors that include the scope attribute is impossible; ignoring it risks matching elements from other components with the same class name.

### Svelte

Svelte compiles components to imperative DOM operations with no virtual DOM, which changes the dynamics:

**No virtual DOM means no reconciliation — but also no stability guarantees.** Svelte's compiler generates `create_fragment`, `update`, and `destroy` functions that directly manipulate the DOM. There is no diffing step — when state changes, Svelte runs the minimal set of DOM operations needed. This means remediation attributes are less likely to be stripped by wholesale node replacement, but Svelte may still overwrite specific attributes if they conflict with template-declared values. An `aria-expanded` set by the remediation layer will be overwritten if the template also binds `aria-expanded` (even to a different value).

**Compiled output is opaque.** Svelte's generated code is optimized and minified in production. Class names may be hashed (with CSS modules or tools like svelte-preprocess), making CSS class-based state detection (Limitation #11) fragile across builds. The generated DOM manipulation functions are not designed for external introspection.

**Reactive declarations run synchronously.** Svelte's `$:` reactive blocks run synchronously during the microtask that triggered them, before the DOM is updated. The DOM update happens in a subsequent microtask via `$$invalidate`. The remediation's MutationObserver fires after the DOM update, but if it reads state that depends on a chain of reactive declarations, the DOM may reflect an intermediate state.

**Event modifiers are compiled away.** Svelte's `on:click|preventDefault|stopPropagation` compiles to inline code in the event handler. A remediation layer dispatching synthetic events cannot prevent these compiled modifiers from running, and `stopPropagation` in a compiled handler will prevent the synthetic event from reaching parent listeners.

**Component boundaries are invisible.** Unlike React (which has DevTools fiber trees) or Angular (which has injectors and component metadata), Svelte components leave no runtime trace of their boundaries. The remediation layer cannot determine where one component ends and another begins, making it harder to scope fixes to individual components.

### Lit / Web Components

Web Components (and Lit as the most common library) introduce the Shadow DOM, which is the most extreme version of the encapsulation problem:

**Shadow DOM is a hard boundary.** Elements inside a shadow root are not accessible via `document.querySelector()`. A remediation layer operating on the light DOM cannot reach into shadow roots to add ARIA attributes, tabindex, or event listeners. Each shadow root must be discovered and traversed individually, and there is no standard API to enumerate all shadow roots on a page.

**Closed shadow roots are completely inaccessible.** When a component uses `{ mode: 'closed' }`, the shadow root is not exposed on the element at all. No external JavaScript can read or modify its contents. Remediation is impossible for any element inside a closed shadow root.

**`<slot>` projection complicates ARIA references.** Slotted content lives in the light DOM but renders inside the shadow DOM. ARIA reference IDs (aria-labelledby, aria-describedby, aria-controls) do not cross shadow boundaries — an ID in the light DOM cannot be referenced from inside the shadow root, and vice versa. This makes Limitation #15 (conditional rendering breaks ARIA references) structural rather than timing-dependent.

**CSS custom properties are the only styling bridge.** The remediation layer cannot inject styles into a shadow root. Only CSS custom properties (variables) and inherited properties pass through the shadow boundary. Color-only indicators (Limitation #4) inside shadow DOM cannot be visually remediated at all.

**Lit's reactive update cycle has its own timing.** Lit batches property changes and renders asynchronously via `requestAnimationFrame` or microtask. The `updateComplete` promise is only accessible from inside the component. External MutationObservers face the same timing gap as with other frameworks, but with the added problem that the observer must be attached to each shadow root individually.

### Solid

Solid's fine-grained reactivity model is the closest to "no framework overhead," but the same limitations apply:

**No virtual DOM, no component instances at runtime.** Solid compiles JSX to direct DOM creation calls. Components are functions that run once — there are no component instances to inspect or lifecycle hooks to observe. The DOM is the only interface, same as with every other framework.

**Signals update DOM synchronously.** When a Solid signal changes, dependent DOM updates run synchronously in the same microtask. This makes the timing gap (Limitation #14) narrower than in React or Vue, but it still exists — the MutationObserver callback is always deferred to the next microtask. During that gap, the DOM has been updated but remediation has not been re-applied.

**Compiled control flow creates/destroys DOM.** Solid's `<Show>`, `<For>`, and `<Switch>` components conditionally create and destroy DOM nodes, identical to React/Vue conditional rendering. ARIA references break on destruction (Limitation #15).

---

## Comparative severity matrix

The following table rates each limitation category by framework, from the React baseline. "Same" means the limitation manifests identically. "Worse" means the framework's architecture makes the problem harder to work around. "Slightly better" means the framework's behavior reduces (but does not eliminate) the impact.

| # | Limitation | React | Angular | Vue | Svelte | Lit/WC | Solid |
|---|-----------|-------|---------|-----|--------|--------|-------|
| 1 | Non-semantic elements | Same | Same | Same | Same | Same | Same |
| 2 | Heading injection | Same | Same | Same | Same | Same | Same |
| 3 | Scope on non-th | Same | Same | Same | Same | Same | Same |
| 4 | Color-only indicators | Same | Same | Same | Same | **Worse** (shadow CSS) | Same |
| 5 | Label click-to-focus | Same | Same | Same | Same | Same | Same |
| 6 | Link behavior | Same | Same | Same | Same | Same | Same |
| 7 | Type-ahead | Same | Same | Same | Same | Same | Same |
| 8 | Overlay click-to-close | Same | Same | Same | Same | Same | Same |
| 9 | Auto-play pause | Same | Same | Same | Same | Same | Same |
| 10 | Simulated mouse events | Same | Same | Same | Same | **Worse** (shadow DOM) | Same |
| 11 | CSS class state detection | Same | **Worse** (encapsulation) | **Worse** (transitions) | **Worse** (hashed classes) | **Worse** (shadow DOM) | Same |
| 12 | Simulated clicks | Same | Same | Same | **Worse** (compiled modifiers) | **Worse** (shadow DOM) | Same |
| 13 | Sort char parsing | Same | Same | Same | Same | Same | Same |
| 14 | Re-render stripping | Same | **Worse** (Zone.js) | Same | Slightly better | Same per shadow root | Slightly better |
| 15 | Conditional rendering | Same | Same | Same | Same | **Worse** (slot projection) | Same |
| 16 | Nesting depth | Same | Same | Same | Same | **Worse** (shadow DOM) | Same |
| 17 | CSS value extraction | Same | Same | Same | Same | **Worse** (shadow DOM) | Same |
| 18 | Icon labels | Same | Same | Same | Same | **Worse** (shadow DOM) | Same |
| 19 | 2D navigation cost | Same | Same | Same | Same | Same | Same |
| 20 | Timestamp inference | Same | Same | Same | Same | Same | Same |
| 21 | Disclosure focus | Same | Same | Same | Same | Same | Same |
| 22 | Announcement timing | Same | Same | Same | Same | Same | Same |
| 23 | Background inert | Same | Same | Same | Same | **Worse** (shadow DOM) | Same |

**Key observation:** The structurally unfixable issues (1–9) are identical across all frameworks — they stem from the fundamental inability to replace non-semantic elements or inject native behaviors. The unreliable/fragile issues (10–23) are the same or worse. No framework makes any limitation category better in a way that matters for real-world remediation.

---

## Web Components deserve special attention

Shadow DOM is the only technology in this list that creates a genuinely new category of limitation rather than a variation on existing ones. A remediation layer cannot:

- **Query elements** inside shadow roots via global selectors
- **Attach event listeners** to shadow DOM elements from outside
- **Set ARIA attributes** on elements it cannot reach
- **Inject styles** to fix visual-only indicators
- **Traverse ARIA references** across shadow boundaries

This means that as the web platform moves toward Web Components — whether via Lit, Stencil, Shoelace, or framework-native web component output (Angular Elements, Vue's `defineCustomElement`) — the surface area accessible to overlay remediation shrinks. Components that were merely difficult to fix in React/Angular/Vue become **impossible** to fix when wrapped in shadow DOM.

---

## Framework-agnostic conclusions

### What overlays claim vs. what is possible

Accessibility overlay vendors market their products as framework-agnostic solutions. The premise is that since the browser sees the same DOM regardless of framework, a single remediation layer can fix accessibility issues across any technology stack.

This premise is technically true for a narrow category of fixes: adding `aria-label` to a static element, setting `role` on a div that never re-renders, or adding `tabindex` to a non-interactive element on a page that does not use client-side rendering. These are the "reasonably fixed" 46% from our React findings.

For the remaining 54% — the issues that are either impossible or fragile — the framework matters. Each framework has its own rendering cycle, event system, encapsulation model, and state management strategy. A remediation layer must account for all of them simultaneously when deployed on pages that mix frameworks (micro-frontends, widget embeds, third-party components). The combinatorial complexity makes reliable remediation intractable at scale.

### The 54% problem is a floor, not a ceiling

The 54% of issues that are unfixable or fragile in React represents the best case. React's synthetic event system is relatively predictable, its reconciliation algorithm is well-documented, and it does not use shadow DOM by default. Angular's Zone.js, Vue's transition classes, Svelte's compiled modifiers, and Lit's shadow DOM each add new failure modes that push the fragile percentage higher.

No controlled study of these frameworks has been conducted in this project, but the architectural analysis strongly suggests:

- **Angular:** ~55–60% unfixable or fragile (Zone.js re-render frequency, encapsulated styles)
- **Vue:** ~55–58% unfixable or fragile (transition class interference, aggressive key-based diffing)
- **Svelte:** ~54–57% unfixable or fragile (compiled event modifiers, hashed class names in production)
- **Lit/Web Components:** ~65–75% unfixable or fragile (shadow DOM makes entire component subtrees unreachable)

### The fundamental constraint is universal

The sentence from LIMITATIONS.md applies to every framework covered here:

> Post-render remediation is working against the framework, not with it.

Replace "React" with any framework name and the five properties hold:

1. Attributes are ephemeral — the framework re-renders and erases them
2. Structure is immutable — divs cannot become semantic elements
3. State is opaque — it must be reverse-engineered from DOM artifacts
4. Events are synthetic — the remediation cannot trigger state updates directly
5. Timing is adversarial — there is always a gap between DOM change and re-remediation

These are not implementation details that better engineering can overcome. They are consequences of the component model itself. Any system that renders DOM from internal state and expects to be the sole writer of that DOM will resist external modification. This is true today and will remain true as frameworks evolve, because the component model's value proposition — encapsulation, composability, declarative rendering — is precisely what makes external remediation unreliable.
