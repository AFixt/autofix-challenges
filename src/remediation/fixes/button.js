/**
 * Post-render remediation for the Button component.
 *
 * Fixes attempted:
 * - Add role="button" to all .btn-demo elements not already using a <button> tag
 * - Add tabindex="0" to make non-button elements keyboard focusable
 * - Add Enter/Space keyboard activation via makeClickable
 * - Add aria-pressed to toggle buttons, synced to .pressed class state
 * - Add aria-disabled="true" to disabled buttons, prevent activation
 * - Add aria-label to icon-only buttons derived from a title or data attribute
 *
 * Limitations discovered:
 * - Cannot reliably compute a label for icon buttons that have no text, title,
 *   or data-label attribute; those will receive a generic fallback label
 * - aria-pressed state must be re-applied after every React re-render because
 *   React class changes do not trigger tracked attribute updates
 * - Disabled buttons with pointer-events:none still receive keyboard events
 *   after tabindex is set; the keydown guard is required to block activation
 */

import { setRole, setAria, setTabIndex } from '../lib/aria.js';
import { onKeyDown, makeClickable } from '../lib/keyboard.js';
import { queryAll } from '../lib/dom.js';
import { observeChanges, onElementAdded } from '../lib/observer.js';

function remediateButton(widget) {
  const buttons = queryAll('.btn-demo', widget);

  buttons.forEach((btn, i) => {
    const tag = btn.tagName.toLowerCase();

    if (tag !== 'button') {
      setRole(btn, 'button');
      setTabIndex(btn, 0);
    }

    const isToggle = btn.classList.contains('toggle');
    const isDisabled = btn.classList.contains('disabled');
    const isIconBtn = btn.classList.contains('icon-btn');

    if (isToggle) {
      const pressed = btn.classList.contains('pressed');
      setAria(btn, 'pressed', String(pressed));
    }

    if (isDisabled) {
      setAria(btn, 'disabled', 'true');
      // Guard keyboard activation for disabled state
      onKeyDown(btn, `btn-disabled-guard-${i}`, (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          e.stopPropagation();
        }
      });
    } else {
      if (tag !== 'button') {
        makeClickable(btn, `btn-clickable-${i}`);
      }
    }

    if (isIconBtn) {
      const label =
        btn.getAttribute('aria-label') ||
        btn.getAttribute('title') ||
        btn.dataset.label ||
        btn.textContent.trim() ||
        'Button';
      setAria(btn, 'label', label);
    }
  });
}

export function apply() {
  const cleanups = [];

  const setup = (widget) => {
    remediateButton(widget);

    const stop = observeChanges(widget, () => {
      remediateButton(widget);
    });
    cleanups.push(stop);
  };

  const stopWatching = onElementAdded('.button-widget', setup);
  cleanups.push(stopWatching);

  return () => cleanups.forEach((fn) => fn());
}
