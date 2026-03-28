/**
 * Post-render remediation for the Disclosure component.
 *
 * Fixes attempted:
 * - Add role="button" and tabindex="0" to .disclosure-toggle and .specs-toggle elements
 * - Add aria-expanded reflecting whether the controlled panel is visible
 * - Add aria-controls linking each toggle to its panel (.product-full / .specs-content)
 * - Add Enter/Space keyboard activation to toggle elements
 * - Ensure controlled panels have unique IDs for aria-controls to reference
 * - Move focus into the revealed content when the panel is expanded, so
 *   keyboard users are aware that content has appeared
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
 * - Focus management on expand uses requestAnimationFrame to wait for React
 *   to finish rendering the panel; on slow devices the panel may not yet be
 *   in the DOM when focus is attempted
 */

import { setAria, setTabIndex, ensureId, controls } from '../lib/aria.js';
import { buttonify } from '../lib/keyboard.js';
import { createFix } from '../lib/fixFactory.js';

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

    buttonify(toggle, `disclosure-toggle-${i}`);

    const expanded = isVisible(panel);
    const wasExpanded = toggle.getAttribute('aria-expanded') === 'true';
    setAria(toggle, 'expanded', String(expanded));

    if (panel) {
      ensureId(panel, `disclosure-panel-${i}`);
      controls(toggle, panel);

      // Focus into the newly revealed content
      if (expanded && !wasExpanded) {
        setTabIndex(panel, -1);
        requestAnimationFrame(() => {
          if (isVisible(panel)) panel.focus();
        });
      }
    }
  });
}

export const apply = createFix('.disclosure-widget', remediateDisclosure);
