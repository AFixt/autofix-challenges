/**
 * Post-render remediation for the Modal Dialog component.
 *
 * Fixes attempted:
 * - Add role="dialog" and aria-modal="true"
 * - Add aria-labelledby pointing to the title
 * - Trap focus inside the modal
 * - Move focus into modal on open
 * - Return focus to trigger on close
 * - Add Escape key to close
 * - Make span-based buttons keyboard operable
 * - Add button role to interactive spans
 *
 * Limitations discovered:
 * - Cannot intercept React state changes; Escape closes by simulating click on close button
 * - Focus return depends on being able to identify the trigger element
 * - Toggle switch remediation is fragile — relies on class mutation to infer state
 * - Re-renders from React will strip ARIA attributes; MutationObserver must re-apply
 */

import { setRole, setAria, setTabIndex, labelledBy, ensureId } from '../lib/aria.js';
import { onKeyDown, makeClickable } from '../lib/keyboard.js';
import { trapFocus, focusFirst, saveFocus } from '../lib/focus.js';
import { queryAll } from '../lib/dom.js';
import { onElementAdded, onElementRemoved } from '../lib/observer.js';

let restoreFocus = null;
let removeTrap = null;
let activeToggleObserver = null;

function remediateModal(overlay) {
  const container = overlay.querySelector('.modal-container');
  if (!container) return;

  // Role and labelling
  setRole(container, 'dialog');
  setAria(container, 'modal', 'true');

  const title = container.querySelector('.modal-title');
  if (title) {
    labelledBy(container, title);
  }

  // Make the close button a proper button
  const closeBtn = container.querySelector('.close-btn');
  if (closeBtn) {
    setRole(closeBtn, 'button');
    setTabIndex(closeBtn, 0);
    setAria(closeBtn, 'label', 'Close dialog');
    makeClickable(closeBtn, 'closeBtn');
  }

  // Make footer action spans into buttons
  const actions = container.querySelectorAll('.btn');
  actions.forEach((btn, i) => {
    setRole(btn, 'button');
    setTabIndex(btn, 0);
    makeClickable(btn, `actionBtn-${i}`);
  });

  // Remediate the toggle switch
  const toggleSwitch = container.querySelector('.toggle-switch');
  if (toggleSwitch) {
    setRole(toggleSwitch, 'switch');
    setTabIndex(toggleSwitch, 0);
    setAria(toggleSwitch, 'checked', toggleSwitch.classList.contains('active'));
    setAria(toggleSwitch, 'label', 'Enable email notifications');
    makeClickable(toggleSwitch, 'toggleSwitch');

    // Watch for class changes to update aria-checked
    if (activeToggleObserver) activeToggleObserver.disconnect();
    activeToggleObserver = new MutationObserver(() => {
      setAria(toggleSwitch, 'checked', toggleSwitch.classList.contains('active'));
    });
    activeToggleObserver.observe(toggleSwitch, { attributes: true, attributeFilter: ['class'] });
  }

  // Associate labels with inputs
  const formGroups = container.querySelectorAll('.form-group');
  formGroups.forEach((group) => {
    const labelText = group.querySelector('.label-text');
    const input = group.querySelector('.modal-input');
    if (labelText && input) {
      const labelId = ensureId(labelText, 'modal-label');
      setAria(input, 'labelledby', labelId);
    }
  });

  // Escape key to close
  onKeyDown(container, 'escapeClose', (e) => {
    if (e.key === 'Escape') {
      e.preventDefault();
      // Simulate clicking the close button since we can't modify React state directly
      if (closeBtn) closeBtn.click();
    }
  });

  // Trap focus inside the modal
  removeTrap = trapFocus(container);

  // Move focus into modal
  focusFirst(container);
}

function onModalClosed() {
  if (removeTrap) {
    removeTrap();
    removeTrap = null;
  }
  if (activeToggleObserver) {
    activeToggleObserver.disconnect();
    activeToggleObserver = null;
  }
  if (restoreFocus) {
    restoreFocus();
    restoreFocus = null;
  }
}

export function apply() {
  const cleanups = [];

  // Make the open trigger a proper button
  const setupTrigger = () => {
    const openBtn = document.querySelector('.open-btn');
    if (openBtn) {
      setRole(openBtn, 'button');
      setTabIndex(openBtn, 0);
      makeClickable(openBtn, 'openBtn');
    }
  };

  // Watch for the modal overlay to appear
  const stopWatchingAdded = onElementAdded('.modal-overlay', (overlay) => {
    restoreFocus = saveFocus();
    // Small delay to let React finish rendering children
    requestAnimationFrame(() => {
      remediateModal(overlay);
    });
  });
  cleanups.push(stopWatchingAdded);

  // Watch for the modal to be removed
  const stopWatchingRemoved = onElementRemoved('.modal-overlay', () => {
    onModalClosed();
  });
  cleanups.push(stopWatchingRemoved);

  // Initial setup for the trigger button
  setupTrigger();

  // Re-setup trigger if the page re-renders
  const stopWatchingTrigger = onElementAdded('.open-btn', () => {
    setupTrigger();
  });
  cleanups.push(stopWatchingTrigger);

  return () => {
    cleanups.forEach((fn) => fn());
    onModalClosed();
  };
}
