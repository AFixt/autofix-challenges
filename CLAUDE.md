# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Purpose

Research platform for studying **post-rendered remediation** of accessibility issues in component-based UIs. Components are intentionally built with accessibility problems so that JavaScript-based repair techniques can be developed and tested against them.

## Commands

- `npm run dev` — start Vite dev server
- `npm run build` — production build
- `npm run preview` — preview production build

## Architecture

React + Vite app with React Router. Each component is a standalone demo accessible via navigation.

**Routes:** `/` (home), `/modal`, `/tabs`, `/accordion`, `/table`, `/tree`

**Component structure:** Each component lives in `src/components/<Name>/` with its own `.jsx` and `.css` files. Components are wired into `src/App.jsx` via a `demos` array that drives both routing and navigation.

## Accessibility Issues by Component

Each component documents its intentional accessibility issues in a JSDoc comment at the top of its `.jsx` file. Issue categories include:

- **Structural:** Non-semantic elements (`<div>`, `<span>`) used in place of native HTML (`<button>`, `<table>`, `<dialog>`, `<ul>`)
- **ARIA:** Missing roles, states, properties, and relationships (`aria-expanded`, `aria-selected`, `aria-sort`, `role="dialog"`, etc.)
- **Focus management:** No focus trapping, no focus restoration, missing `tabindex`
- **Keyboard:** No key handlers for expected patterns (arrow keys, Escape, Enter/Space)

## Remediation Layer

External JavaScript in `src/remediation/` that attempts to repair each component's accessibility issues post-render, simulating what accessibility overlay vendors claim to do.

**Structure:**
- `src/remediation/lib/` — Shared utility library (aria, keyboard, focus, dom, announce, observer)
- `src/remediation/fixes/` — Per-component fix modules, each exporting an `apply()` function
- `src/remediation/index.js` — Orchestrator that enables/disables all fixes

**Toggle:** The nav bar has a "Remediation ON/OFF" button that calls `enableRemediation()` / `disableRemediation()` at runtime.

Each fix module documents both the fixes attempted and the **limitations discovered** — the real research value is in what *cannot* be reliably fixed externally.
