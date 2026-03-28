/**
 * Post-render remediation for the Alert component.
 *
 * Fixes attempted:
 * - Add role="alert" and aria-live="assertive" to alert items
 * - Add aria-atomic="true" so the full message is announced on update
 * - Make dismiss buttons accessible with role="button", tabindex, and aria-label
 * - Ensure each alert message is associated with its dismiss control
 * - Add keyboard activation (Enter/Space) to dismiss buttons
 * - Add aria-label to the alert-list container for landmark identification
 * - Add aria-label to alert type icons (.alert-icon) so the alert category
 *   (success, warning, error, info) is conveyed beyond color and symbol
 *
 * Limitations discovered:
 * - Cannot inject a true <button> element without breaking React reconciliation
 * - The aria-live region must already exist before content is inserted for
 *   reliable announcements; dynamically added role="alert" nodes may be missed
 *   by some screen readers (VoiceOver in particular)
 * - Dismiss action removes the DOM node, so cleanup of tracked attributes
 *   happens automatically via MutationObserver reconnect
 * - Alert type is conveyed by color plus ambiguous Unicode symbols (●, ▲, ✕, ℹ);
 *   aria-label provides the type name but sighted users with color vision
 *   deficiency still rely on the shape alone
 */

import { setRole, setAria, ensureId } from '../lib/aria.js';
import { buttonify } from '../lib/keyboard.js';
import { queryAll } from '../lib/dom.js';
import { createFix } from '../lib/fixFactory.js';

const ALERT_TYPE_LABELS = {
  success: 'Success',
  warning: 'Warning',
  error: 'Error',
  info: 'Information',
};

function getAlertType(item) {
  for (const type of Object.keys(ALERT_TYPE_LABELS)) {
    if (item.classList.contains(`alert-${type}`)) return type;
  }
  return null;
}

function remediateAlert(widget) {
  const alertList = widget.querySelector('.alert-list');
  if (alertList && !alertList.getAttribute('aria-label')) {
    setAria(alertList, 'label', 'Notifications');
  }

  const items = queryAll('.alert-item', widget);

  items.forEach((item) => {
    setRole(item, 'alert');
    setAria(item, 'live', 'assertive');
    setAria(item, 'atomic', 'true');

    // Label the alert type icon so the category is not conveyed by color alone
    const icon = item.querySelector('.alert-icon');
    const alertType = getAlertType(item);
    if (icon && alertType) {
      setAria(icon, 'label', ALERT_TYPE_LABELS[alertType]);
    }

    const message = item.querySelector('.alert-message');
    const dismiss = item.querySelector('.alert-dismiss');

    if (dismiss) {
      buttonify(dismiss, `alert-dismiss-${ensureId(item, 'alert')}`);

      if (message) {
        const msgId = ensureId(message, 'alert-msg');
        setAria(dismiss, 'label', `Dismiss alert: ${message.textContent.trim()}`);
        setAria(dismiss, 'describedby', msgId);
      } else {
        setAria(dismiss, 'label', 'Dismiss alert');
      }
    }

    if (message) {
      ensureId(message, 'alert-msg');
    }
  });
}

export const apply = createFix('.alert-widget', remediateAlert);
