/**
 * Focus management utilities for post-render remediation.
 *
 * Handles focus trapping, focus restoration, and roving tabindex patterns
 * that are commonly missing from inaccessible components.
 * All tabIndex changes are tracked for reversal.
 */

import { trackProperty, trackListener } from './tracker.js';

const FOCUSABLE_SELECTOR = [
  'a[href]',
  'button:not([disabled])',
  'input:not([disabled])',
  'select:not([disabled])',
  'textarea:not([disabled])',
  '[tabindex]:not([tabindex="-1"])',
].join(', ');

/**
 * Get all focusable elements within a container.
 */
export function getFocusable(container) {
  if (!container) return [];
  return Array.from(container.querySelectorAll(FOCUSABLE_SELECTOR));
}

/**
 * Trap focus within a container. Tab and Shift+Tab wrap around.
 * Returns a cleanup function to remove the trap.
 */
export function trapFocus(container) {
  if (!container) return () => {};

  const handler = (e) => {
    if (e.key !== 'Tab') return;

    const focusable = getFocusable(container);
    if (focusable.length === 0) {
      e.preventDefault();
      return;
    }

    const first = focusable[0];
    const last = focusable[focusable.length - 1];

    if (e.shiftKey) {
      if (document.activeElement === first) {
        e.preventDefault();
        last.focus();
      }
    } else {
      if (document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    }
  };

  container.addEventListener('keydown', handler);
  trackListener(container, '__focusTrap', 'keydown', handler);
  return () => {
    container.removeEventListener('keydown', handler);
  };
}

/**
 * Move focus to the first focusable element inside a container.
 */
export function focusFirst(container) {
  if (!container) return;
  const focusable = getFocusable(container);
  if (focusable.length > 0) {
    focusable[0].focus();
  } else {
    // If no focusable children, make the container itself focusable
    trackProperty(container, 'tabIndex');
    container.tabIndex = -1;
    container.focus();
  }
}

/**
 * Save the currently focused element and return a function to restore it.
 */
export function saveFocus() {
  const saved = document.activeElement;
  return () => {
    if (saved && saved.focus && document.body.contains(saved)) {
      saved.focus();
    }
  };
}

/**
 * Implement roving tabindex on a set of elements.
 * Only the active item has tabindex=0; all others have tabindex=-1.
 */
export function rovingTabIndex(items, activeIndex) {
  items.forEach((item, i) => {
    trackProperty(item, 'tabIndex');
    item.tabIndex = i === activeIndex ? 0 : -1;
  });
}
