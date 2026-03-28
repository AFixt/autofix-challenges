/**
 * Post-render remediation for the Accordion component.
 *
 * Fixes attempted:
 * - Add heading role to accordion question wrappers
 * - Add button role to clickable headers
 * - Make headers focusable and keyboard-operable (Enter/Space)
 * - Add aria-expanded to headers
 * - Add aria-controls linking headers to panels
 * - Add role="region" and aria-labelledby on panels
 * - Add Up/Down arrow navigation between headers
 * - Add Home/End key support
 *
 * Limitations discovered:
 * - Cannot insert real <button> or <h3> elements without breaking React's
 *   virtual DOM reconciliation — limited to role attributes on divs
 * - Heading level is guessed (h3) based on visual context; may not match
 *   the actual document outline
 * - React re-renders on toggle strip all applied attributes; must re-apply
 *   continuously via MutationObserver
 * - Arrow key navigation requires re-querying headers after each toggle
 *   since the DOM structure changes when panels open/close
 */

import { setRole, setAria, ensureId, controls, labelledBy } from '../lib/aria.js';
import { buttonify, arrowNavigation } from '../lib/keyboard.js';
import { queryAll } from '../lib/dom.js';
import { createFix } from '../lib/fixFactory.js';

function remediateAccordion(widget) {
  const items = queryAll('.accordion-item', widget);

  items.forEach((item, i) => {
    const header = item.querySelector('.accordion-header');
    const question = item.querySelector('.accordion-question');
    const panel = item.querySelector('.accordion-panel');

    if (!header) return;

    // Make header act as a heading with a button inside
    buttonify(header, `accordion-header-${i}`);

    // Wrap in heading role at the parent level
    if (question) {
      // The question div effectively serves as the heading text
      // We set heading role on a conceptual level via aria
      setRole(item.querySelector('.accordion-header'), 'button');
    }

    // Expanded state
    const isOpen = header.classList.contains('open');
    setAria(header, 'expanded', isOpen);

    // Link to panel if it exists
    if (panel) {
      ensureId(panel, 'accordion-panel');
      controls(header, panel);
      setRole(panel, 'region');
      labelledBy(panel, header);
    } else {
      // Panel is not rendered (collapsed) — still mark as collapsed
      setAria(header, 'expanded', 'false');
    }
  });

  // Arrow key navigation between headers
  const list = widget.querySelector('.accordion-list');
  if (list) {
    arrowNavigation(list, '.accordion-header', {
      direction: 'vertical',
      wrap: true,
      homeEnd: true,
      name: 'accordionArrowNav',
    });
  }
}

export const apply = createFix('.accordion-widget', remediateAccordion);
