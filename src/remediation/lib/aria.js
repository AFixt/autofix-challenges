/**
 * ARIA attribute utilities for post-render remediation.
 *
 * These functions apply ARIA roles, states, and properties to DOM elements
 * that were rendered without them. All changes are tracked for reversal.
 */

import { trackAttribute, trackProperty } from './tracker.js';

/**
 * Set a role on an element if it doesn't already have one.
 */
export function setRole(el, role) {
  if (el && el.getAttribute('role') !== role) {
    trackAttribute(el, 'role');
    el.setAttribute('role', role);
  }
}

/**
 * Set an ARIA attribute, only writing when the value has changed.
 */
export function setAria(el, attr, value) {
  if (!el) return;
  const fullAttr = attr.startsWith('aria-') ? attr : `aria-${attr}`;
  const strValue = String(value);
  if (el.getAttribute(fullAttr) !== strValue) {
    trackAttribute(el, fullAttr);
    el.setAttribute(fullAttr, strValue);
  }
}

/**
 * Remove an ARIA attribute.
 */
export function removeAria(el, attr) {
  if (!el) return;
  const fullAttr = attr.startsWith('aria-') ? attr : `aria-${attr}`;
  trackAttribute(el, fullAttr);
  el.removeAttribute(fullAttr);
}

/**
 * Ensure an element has an id. Generates one if missing.
 * Returns the id.
 */
let idCounter = 0;
export function ensureId(el, prefix = 'rem') {
  if (!el) return '';
  if (!el.id) {
    trackAttribute(el, 'id');
    el.id = `${prefix}-${++idCounter}`;
  }
  return el.id;
}

/**
 * Link two elements via aria-labelledby.
 * Ensures the label element has an id, then sets aria-labelledby on the target.
 */
export function labelledBy(target, labelEl) {
  if (!target || !labelEl) return;
  const id = ensureId(labelEl);
  setAria(target, 'labelledby', id);
}

/**
 * Link two elements via aria-controls.
 * Ensures the controlled element has an id, then sets aria-controls on the controller.
 */
export function controls(controller, controlled) {
  if (!controller || !controlled) return;
  const id = ensureId(controlled);
  setAria(controller, 'controls', id);
}

/**
 * Set aria-expanded on an element based on a boolean.
 */
export function setExpanded(el, expanded) {
  setAria(el, 'expanded', expanded);
}

/**
 * Set aria-selected on an element based on a boolean.
 */
export function setSelected(el, selected) {
  setAria(el, 'selected', selected);
}

/**
 * Set aria-hidden on an element.
 */
export function setHidden(el, hidden) {
  setAria(el, 'hidden', hidden);
}

/**
 * Set tabindex on an element.
 */
export function setTabIndex(el, index) {
  if (el && el.tabIndex !== index) {
    trackProperty(el, 'tabIndex');
    el.tabIndex = index;
  }
}

/**
 * Derive an accessible label from multiple fallback sources.
 * Checks aria-label, title, data-label, then text content.
 * Returns the fallback if nothing meaningful is found.
 */
export function getLabel(el, fallback = 'Element') {
  if (!el) return fallback;
  return (
    el.getAttribute('aria-label') ||
    el.getAttribute('title') ||
    el.dataset.label ||
    el.textContent.trim() ||
    fallback
  );
}

/**
 * Extract a numeric value from an element's data attributes, inline styles,
 * or existing ARIA attributes, in that priority order.
 *
 * @param {Element} el - The element to read from
 * @param {string} [cssProp] - CSS property name to check (e.g. 'left', 'width')
 * @param {number} [defaultValue=0] - Returned when no value is found
 */
export function extractValue(el, cssProp, defaultValue = 0) {
  if (!el) return defaultValue;

  // 1. data-value attribute (most explicit)
  if (el.dataset.value !== undefined) return parseFloat(el.dataset.value);

  // 2. Existing aria-valuenow
  const existing = el.getAttribute('aria-valuenow');
  if (existing) return parseFloat(existing);

  // 3. Inline style percentage
  if (cssProp) {
    const style = el.style[cssProp];
    if (style && style.endsWith('%')) return parseFloat(style);
  }

  return defaultValue;
}