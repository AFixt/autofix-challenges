/**
 * Post-render remediation for the Tooltip component.
 *
 * Fixes attempted:
 * - Add role="tooltip" to .tip-popup elements
 * - Add aria-describedby on each .tip-trigger pointing to the tooltip element
 * - Show the tooltip on focus (in addition to hover, which is handled by CSS)
 * - Hide the tooltip on blur and on Escape key press
 * - Add role="button" and tabindex to .tip-icon-btn elements that are not <button>
 * - Handle .tip-term elements (inline definitions) with aria-describedby to definition
 * - Add aria-label from .tip-help-icon if no other label exists
 *
 * Limitations discovered:
 * - Tooltip visibility is controlled by React state (class toggle or conditional render);
 *   focus/blur handlers call .click() on the trigger to open/close, which relies on
 *   the component's event handlers — this may cause double-toggle on real buttons
 * - If the tooltip is conditionally rendered (removed from DOM when hidden),
 *   aria-describedby cannot reference it and announcements will be silent;
 *   role="tooltip" must be present in the DOM at all times to work reliably
 * - Escape key dismissal requires the tooltip to remain in the DOM with display:none
 *   rather than being unmounted by React
 * - On touch devices, focus-based display does not apply; hover must remain the
 *   primary mechanism
 */

import { setRole, setAria, setTabIndex, ensureId } from '../lib/aria.js';
import { makeClickable, onKeyDown } from '../lib/keyboard.js';
import { queryAll } from '../lib/dom.js';
import { createFix } from '../lib/fixFactory.js';

function remediateTooltip(widget) {
  const triggers = queryAll('.tip-trigger', widget);
  const iconBtns = queryAll('.tip-icon-btn', widget);

  triggers.forEach((trigger, ti) => {
    const popup = trigger.querySelector('.tip-popup') ||
      trigger.nextElementSibling?.classList.contains('tip-popup')
        ? trigger.nextElementSibling
        : widget.querySelectorAll('.tip-popup')[ti];

    if (popup) {
      setRole(popup, 'tooltip');
      const popupId = ensureId(popup, `tip-popup-${ti}`);
      setAria(trigger, 'describedby', popupId);
    }

    // Ensure trigger is keyboard reachable
    const tag = trigger.tagName.toLowerCase();
    if (tag !== 'button' && tag !== 'a' && trigger.tabIndex < 0) {
      setTabIndex(trigger, 0);
    }

    // Show tooltip on focus (for keyboard users)
    if (!trigger._tooltipFocusHandler) {
      trigger._tooltipFocusHandler = () => {
        if (popup) {
          popup.hidden = false;
          popup.style.display = '';
        }
      };
      trigger.addEventListener('focus', trigger._tooltipFocusHandler);
    }

    if (!trigger._tooltipBlurHandler) {
      trigger._tooltipBlurHandler = () => {
        if (popup) {
          popup.hidden = true;
        }
      };
      trigger.addEventListener('blur', trigger._tooltipBlurHandler);
    }

    // Escape to dismiss
    onKeyDown(trigger, `tooltip-escape-${ti}`, (e) => {
      if (e.key === 'Escape' && popup) {
        e.preventDefault();
        popup.hidden = true;
      }
    });
  });

  // Icon buttons inside tooltip widgets
  iconBtns.forEach((btn, bi) => {
    const tag = btn.tagName.toLowerCase();
    if (tag !== 'button') {
      setRole(btn, 'button');
      setTabIndex(btn, 0);
      makeClickable(btn, `tip-icon-btn-${bi}`);
    }

    const helpIcon = btn.querySelector('.tip-help-icon');
    if (!btn.getAttribute('aria-label')) {
      const label =
        btn.getAttribute('title') ||
        btn.textContent.trim() ||
        (helpIcon ? 'Help' : 'Information');
      setAria(btn, 'label', label);
    }
  });

  // Terms with inline tooltip definitions (.tip-term)
  const terms = queryAll('.tip-term', widget);
  terms.forEach((term, ti) => {
    const popup = term.querySelector('.tip-popup') ||
      document.getElementById(term.dataset.tooltip);

    if (popup) {
      setRole(popup, 'tooltip');
      const popupId = ensureId(popup, `tip-term-popup-${ti}`);
      setAria(term, 'describedby', popupId);
    }

    if (term.tabIndex < 0) {
      setTabIndex(term, 0);
    }
  });
}

export const apply = createFix('.tooltip-widget', remediateTooltip);
