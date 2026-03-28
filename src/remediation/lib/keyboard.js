/**
 * Keyboard interaction utilities for post-render remediation.
 *
 * Adds keyboard handlers to elements that were rendered without them.
 * Uses a tracking mechanism to avoid attaching duplicate listeners
 * and to enable full removal on remediation disable.
 */

import { trackListener, untrackListener } from './tracker.js';

const HANDLER_KEY = '__remediationHandlers';

/**
 * Attach a keydown handler to an element, tracking it to prevent duplicates.
 * The `name` parameter identifies this handler so it won't be re-added.
 */
export function onKeyDown(el, name, handler) {
  if (!el) return;
  if (!el[HANDLER_KEY]) el[HANDLER_KEY] = {};
  if (el[HANDLER_KEY][name]) return; // already attached

  el[HANDLER_KEY][name] = handler;
  el.addEventListener('keydown', handler);
  trackListener(el, name, 'keydown', handler);
}

/**
 * Remove a previously attached named keydown handler.
 */
export function offKeyDown(el, name) {
  if (!el || !el[HANDLER_KEY] || !el[HANDLER_KEY][name]) return;
  el.removeEventListener('keydown', el[HANDLER_KEY][name]);
  untrackListener(el, name);
  delete el[HANDLER_KEY][name];
}

/**
 * Make a non-button element (div/span) act like a button.
 * Adds Enter and Space key activation that triggers click.
 */
export function makeClickable(el, name = 'clickable') {
  if (!el) return;
  onKeyDown(el, name, (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      el.click();
    }
  });
}

/**
 * Add arrow key navigation within a group of elements.
 * Supports horizontal (Left/Right) and vertical (Up/Down) modes,
 * with optional wrapping and Home/End keys.
 */
export function arrowNavigation(container, itemSelector, options = {}) {
  const {
    direction = 'horizontal', // 'horizontal' | 'vertical' | 'both'
    wrap = true,
    homeEnd = true,
    onFocus = null, // callback(focusedElement, index) when an item receives focus
    name = 'arrowNav',
  } = options;

  if (!container) return;

  onKeyDown(container, name, (e) => {
    const items = Array.from(container.querySelectorAll(itemSelector));
    if (items.length === 0) return;

    const current = document.activeElement;
    const index = items.indexOf(current);
    if (index === -1) return;

    let next = -1;

    const prev = () => (wrap ? (index - 1 + items.length) % items.length : Math.max(0, index - 1));
    const fwd = () => (wrap ? (index + 1) % items.length : Math.min(items.length - 1, index + 1));

    switch (e.key) {
      case 'ArrowLeft':
        if (direction === 'horizontal' || direction === 'both') next = prev();
        break;
      case 'ArrowUp':
        if (direction === 'vertical' || direction === 'both') next = prev();
        break;
      case 'ArrowRight':
        if (direction === 'horizontal' || direction === 'both') next = fwd();
        break;
      case 'ArrowDown':
        if (direction === 'vertical' || direction === 'both') next = fwd();
        break;
      case 'Home':
        if (homeEnd) next = 0;
        break;
      case 'End':
        if (homeEnd) next = items.length - 1;
        break;
      default:
        return;
    }

    if (next !== -1 && next !== index) {
      e.preventDefault();
      items[next].focus();
      if (onFocus) onFocus(items[next], next);
    }
  });
}
