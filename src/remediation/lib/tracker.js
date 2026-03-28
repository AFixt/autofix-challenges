/**
 * Change tracker for post-render remediation.
 *
 * Records every DOM modification so it can be fully reversed when
 * remediation is disabled. Tracks attribute changes (with original values),
 * added event listeners, and property mutations.
 */

const attrChanges = new Map();  // element -> Map<attrName, originalValue|null>
const propChanges = new Map();  // element -> Map<propName, originalValue>
const listeners = new Map();    // element -> Map<handlerName, { type, handler }>

/**
 * Record that an attribute was set on an element.
 * Only records the original value the first time a given attribute is touched.
 */
export function trackAttribute(el, attr) {
  if (!el) return;
  if (!attrChanges.has(el)) attrChanges.set(el, new Map());
  const elMap = attrChanges.get(el);
  // Only capture original value on first touch
  if (!elMap.has(attr)) {
    const original = el.getAttribute(attr); // null if didn't exist
    elMap.set(attr, original);
  }
}

/**
 * Record that a DOM property (e.g. tabIndex) was set on an element.
 */
export function trackProperty(el, prop) {
  if (!el) return;
  if (!propChanges.has(el)) propChanges.set(el, new Map());
  const elMap = propChanges.get(el);
  if (!elMap.has(prop)) {
    elMap.set(prop, el[prop]);
  }
}

/**
 * Record that an event listener was added.
 */
export function trackListener(el, name, type, handler) {
  if (!el) return;
  if (!listeners.has(el)) listeners.set(el, new Map());
  listeners.get(el).set(name, { type, handler });
}

/**
 * Remove a tracked listener by name.
 */
export function untrackListener(el, name) {
  if (!el || !listeners.has(el)) return;
  const elMap = listeners.get(el);
  const entry = elMap.get(name);
  if (entry) {
    el.removeEventListener(entry.type, entry.handler);
    elMap.delete(name);
  }
}

/**
 * Revert all tracked changes and clear the tracker.
 * - Attributes are restored to their original values (or removed if they didn't exist).
 * - Properties are restored to their original values.
 * - Event listeners are removed.
 */
export function revertAll() {
  // Revert attributes
  for (const [el, attrs] of attrChanges) {
    if (!document.body.contains(el)) continue;
    for (const [attr, originalValue] of attrs) {
      if (originalValue === null) {
        el.removeAttribute(attr);
      } else {
        el.setAttribute(attr, originalValue);
      }
    }
  }
  attrChanges.clear();

  // Revert properties
  for (const [el, props] of propChanges) {
    if (!document.body.contains(el)) continue;
    for (const [prop, originalValue] of props) {
      el[prop] = originalValue;
    }
  }
  propChanges.clear();

  // Remove all event listeners
  for (const [el, handlerMap] of listeners) {
    for (const [, { type, handler }] of handlerMap) {
      el.removeEventListener(type, handler);
    }
  }
  listeners.clear();
}

/**
 * Clear tracking data for elements that are no longer in the DOM.
 * Call periodically to prevent memory leaks from removed elements.
 */
export function pruneDetached() {
  for (const el of attrChanges.keys()) {
    if (!document.body.contains(el)) attrChanges.delete(el);
  }
  for (const el of propChanges.keys()) {
    if (!document.body.contains(el)) propChanges.delete(el);
  }
  for (const el of listeners.keys()) {
    if (!document.body.contains(el)) listeners.delete(el);
  }
}
