/**
 * DOM query and manipulation utilities for post-render remediation.
 *
 * Helpers for finding elements, checking state, and performing
 * lightweight DOM modifications that don't break framework bindings.
 */

/**
 * Query a single element, accepting a string selector or an element.
 */
export function query(selectorOrEl, context = document) {
  if (!selectorOrEl) return null;
  if (selectorOrEl instanceof Element) return selectorOrEl;
  return context.querySelector(selectorOrEl);
}

/**
 * Query all matching elements as an array.
 */
export function queryAll(selector, context = document) {
  return Array.from(context.querySelectorAll(selector));
}

/**
 * Check if an element has been remediated (prevent double-application).
 * Uses a data attribute marker.
 */
export function isRemediated(el, fixName) {
  if (!el) return true;
  return el.dataset.remediated === fixName;
}

/**
 * Mark an element as remediated.
 */
export function markRemediated(el, fixName) {
  if (el) el.dataset.remediated = fixName;
}

/**
 * Check if a container has already been processed (container-level guard).
 */
export function isContainerRemediated(container, fixName) {
  if (!container) return true;
  return container.dataset[`rem_${fixName}`] === 'true';
}

/**
 * Mark a container as processed.
 */
export function markContainerRemediated(container, fixName) {
  if (container) container.dataset[`rem_${fixName}`] = 'true';
}

/**
 * Wait for an element to appear in the DOM.
 * Uses MutationObserver with a timeout.
 * Returns a promise that resolves with the element or null on timeout.
 */
export function waitForElement(selector, timeout = 5000) {
  return new Promise((resolve) => {
    const existing = document.querySelector(selector);
    if (existing) {
      resolve(existing);
      return;
    }

    const observer = new MutationObserver(() => {
      const el = document.querySelector(selector);
      if (el) {
        observer.disconnect();
        resolve(el);
      }
    });

    observer.observe(document.body, { childList: true, subtree: true });

    setTimeout(() => {
      observer.disconnect();
      resolve(null);
    }, timeout);
  });
}

/**
 * Check whether an element is visible (not display:none or visibility:hidden).
 */
export function isVisible(el) {
  if (!el) return false;
  const style = window.getComputedStyle(el);
  return style.display !== 'none' && style.visibility !== 'hidden';
}

/**
 * Simulate a mouse event on an element.
 * Used to trigger React's mouse event handlers from keyboard remediation.
 */
export function simulateMouseEvent(target, type, clientX, clientY) {
  const event = new MouseEvent(type, {
    bubbles: true,
    cancelable: true,
    clientX: clientX ?? 0,
    clientY: clientY ?? 0,
  });
  target.dispatchEvent(event);
}

/**
 * Simulate a complete mouse drag sequence: mousedown on the target,
 * mousemove on the document at the given position, then mouseup.
 * This triggers React handlers that attach document-level move/up listeners
 * during mousedown.
 */
export function simulateDrag(target, clientX, clientY) {
  simulateMouseEvent(target, 'mousedown', clientX, clientY);
  simulateMouseEvent(document, 'mousemove', clientX, clientY);
  simulateMouseEvent(document, 'mouseup', clientX, clientY);
}

/**
 * Calculate the clientX position for a given value within an element's
 * bounding rectangle, mapping a value in [min, max] to a pixel position.
 */
export function valueToClientX(trackEl, value, min, max) {
  const rect = trackEl.getBoundingClientRect();
  const ratio = (value - min) / (max - min);
  return rect.left + ratio * rect.width;
}
