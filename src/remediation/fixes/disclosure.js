/**
 * Post-render remediation for the Disclosure component.
 *
 * Fixes attempted:
 * - Add role="button" and tabindex="0" to .disclosure-toggle and .specs-toggle elements
 * - Add aria-expanded reflecting whether the controlled panel is visible
 * - Add aria-controls linking each toggle to its panel (.product-full / .specs-content)
 * - Add Enter/Space keyboard activation to toggle elements
 * - Ensure controlled panels have unique IDs for aria-controls to reference
 *
 * Limitations discovered:
 * - Expanded state is inferred from the presence/visibility of the controlled
 *   panel in the DOM; if React conditionally renders the panel (removes it
 *   entirely), aria-expanded will correctly reflect "false" but the panel ID
 *   will be unavailable for aria-controls until the panel re-renders
 * - Cannot use a real <button> element without disrupting React's synthetic
 *   event handler bindings on the toggle div
 * - Role "button" on a div does not inherit browser default styles (no focus
 *   ring in some browsers without explicit CSS — beyond the scope of this fix)
 */

import { setRole, setAria, setTabIndex, ensureId, controls } from '../lib/aria.js';
import { makeClickable } from '../lib/keyboard.js';
import { observeChanges, onElementAdded } from '../lib/observer.js';

function isVisible(el) {
  if (!el) return false;
  return !el.hidden && window.getComputedStyle(el).display !== 'none';
}

function remediateDisclosure(widget) {
  const pairs = [
    { toggle: '.disclosure-toggle', panel: '.product-full' },
    { toggle: '.specs-toggle', panel: '.specs-content' },
  ];

  pairs.forEach(({ toggle: toggleSel, panel: panelSel }, i) => {
    const toggle = widget.querySelector(toggleSel);
    const panel = widget.querySelector(panelSel);

    if (!toggle) return;

    const tag = toggle.tagName.toLowerCase();
    if (tag !== 'button') {
      setRole(toggle, 'button');
      setTabIndex(toggle, 0);
      makeClickable(toggle, `disclosure-toggle-${i}`);
    }

    const expanded = isVisible(panel);
    setAria(toggle, 'expanded', String(expanded));

    if (panel) {
      ensureId(panel, `disclosure-panel-${i}`);
      controls(toggle, panel);
    }
  });
}

export function apply() {
  const cleanups = [];

  const setup = (widget) => {
    remediateDisclosure(widget);

    const stop = observeChanges(widget, () => {
      remediateDisclosure(widget);
    });
    cleanups.push(stop);
  };

  const stopWatching = onElementAdded('.disclosure-widget', setup);
  cleanups.push(stopWatching);

  return () => cleanups.forEach((fn) => fn());
}
