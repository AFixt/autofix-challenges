/**
 * DOM observation utilities for post-render remediation.
 *
 * React (and similar frameworks) re-render components, which can
 * remove or replace DOM nodes and strip remediation attributes.
 * These utilities watch for mutations and re-apply fixes.
 */

/**
 * Observe a container for DOM changes and run a callback when mutations occur.
 * Debounces rapid mutations (e.g. React batch updates) into a single callback.
 *
 * Returns a disconnect function.
 */
export function observeChanges(target, callback, options = {}) {
  const {
    debounceMs = 50,
    childList = true,
    subtree = true,
    attributes = false,
    attributeFilter = null,
  } = options;

  let timer = null;

  const observer = new MutationObserver(() => {
    if (timer) clearTimeout(timer);
    timer = setTimeout(() => {
      callback();
    }, debounceMs);
  });

  const observerOptions = { childList, subtree, attributes };
  if (attributeFilter) observerOptions.attributeFilter = attributeFilter;

  observer.observe(target, observerOptions);

  return () => {
    if (timer) clearTimeout(timer);
    observer.disconnect();
  };
}

/**
 * Watch for an element matching a selector to appear, then run a callback.
 * Useful for components that mount lazily (e.g. modals).
 * Runs the callback each time a matching element appears.
 *
 * Returns a disconnect function.
 */
export function onElementAdded(selector, callback) {
  // Check if already present
  const existing = document.querySelector(selector);
  if (existing) callback(existing);

  const observer = new MutationObserver((mutations) => {
    for (const mutation of mutations) {
      for (const node of mutation.addedNodes) {
        if (node.nodeType !== Node.ELEMENT_NODE) continue;
        if (node.matches && node.matches(selector)) {
          callback(node);
        }
        // Also check descendants of added nodes
        if (node.querySelectorAll) {
          const matches = node.querySelectorAll(selector);
          matches.forEach((match) => callback(match));
        }
      }
    }
  });

  observer.observe(document.body, { childList: true, subtree: true });
  return () => observer.disconnect();
}

/**
 * Watch for an element to be removed from the DOM, then run a callback.
 * Returns a disconnect function.
 */
export function onElementRemoved(selector, callback) {
  const observer = new MutationObserver((mutations) => {
    for (const mutation of mutations) {
      for (const node of mutation.removedNodes) {
        if (node.nodeType !== Node.ELEMENT_NODE) continue;
        if (node.matches && node.matches(selector)) {
          callback(node);
        }
        if (node.querySelectorAll) {
          const matches = node.querySelectorAll(selector);
          matches.forEach((match) => callback(match));
        }
      }
    }
  });

  observer.observe(document.body, { childList: true, subtree: true });
  return () => observer.disconnect();
}
