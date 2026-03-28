/**
 * Post-render remediation for the Alert component.
 *
 * Fixes attempted:
 * - Add role="alert" and aria-live="assertive" to alert items
 * - Add aria-atomic="true" so the full message is announced on update
 * - Make dismiss buttons accessible with role="button", tabindex, and aria-label
 * - Ensure each alert message is associated with its dismiss control
 * - Add keyboard activation (Enter/Space) to dismiss buttons
 *
 * Limitations discovered:
 * - Cannot inject a true <button> element without breaking React reconciliation
 * - The aria-live region must already exist before content is inserted for
 *   reliable announcements; dynamically added role="alert" nodes may be missed
 *   by some screen readers (VoiceOver in particular)
 * - Dismiss action removes the DOM node, so cleanup of tracked attributes
 *   happens automatically via MutationObserver reconnect
 */

import { setRole, setAria, ensureId, labelledBy } from '../lib/aria.js';
import { makeClickable } from '../lib/keyboard.js';
import { queryAll } from '../lib/dom.js';
import { observeChanges, onElementAdded } from '../lib/observer.js';

function remediateAlert(widget) {
  const items = queryAll('.alert-item', widget);

  items.forEach((item) => {
    setRole(item, 'alert');
    setAria(item, 'live', 'assertive');
    setAria(item, 'atomic', 'true');

    const message = item.querySelector('.alert-message');
    const dismiss = item.querySelector('.alert-dismiss');

    if (dismiss) {
      setRole(dismiss, 'button');
      dismiss.tabIndex = dismiss.tabIndex < 0 ? 0 : dismiss.tabIndex;

      if (message) {
        const msgId = ensureId(message, 'alert-msg');
        setAria(dismiss, 'label', `Dismiss alert: ${message.textContent.trim()}`);
        setAria(dismiss, 'describedby', msgId);
      } else {
        setAria(dismiss, 'label', 'Dismiss alert');
      }

      makeClickable(dismiss, `alert-dismiss-${ensureId(item, 'alert')}`);
    }

    if (message) {
      ensureId(message, 'alert-msg');
    }
  });
}

export function apply() {
  const cleanups = [];

  const setup = (widget) => {
    remediateAlert(widget);

    const stop = observeChanges(widget, () => {
      remediateAlert(widget);
    });
    cleanups.push(stop);
  };

  const stopWatching = onElementAdded('.alert-widget', setup);
  cleanups.push(stopWatching);

  return () => cleanups.forEach((fn) => fn());
}
