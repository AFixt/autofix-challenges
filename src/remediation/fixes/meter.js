/**
 * Post-render remediation for the Meter component.
 *
 * Fixes attempted:
 * - Add role="meter" to .meter-bar-fill (the element representing the value)
 * - Add aria-valuenow from the fill element's inline width style or data attribute
 * - Add aria-valuemin="0" and aria-valuemax="100" as defaults
 * - Add aria-valuetext with a human-readable description from .meter-text
 * - Add aria-label from .meter-label to give the meter a name
 * - Associate .meter-card container with role="group" and a label
 *
 * Limitations discovered:
 * - aria-valuenow is inferred from the CSS width percentage of .meter-bar-fill;
 *   if the width is set via class names (not inline styles), extraction will fail
 *   and a data-value attribute fallback is used
 * - The <meter> HTML element is the correct semantic choice and renders
 *   correctly in all browsers; role="meter" on a div is a workaround and
 *   may not be supported in older browser/AT combinations
 * - aria-valuemin and aria-valuemax are hardcoded to 0 and 100 respectively;
 *   actual min/max should be read from data attributes when available
 */

import { setRole, setAria, ensureId, labelledBy } from '../lib/aria.js';
import { queryAll } from '../lib/dom.js';
import { observeChanges, onElementAdded } from '../lib/observer.js';

function extractValue(fill) {
  // Try inline style width first (e.g. style="width: 72%")
  const styleWidth = fill.style.width;
  if (styleWidth && styleWidth.endsWith('%')) {
    return parseFloat(styleWidth);
  }

  // Try data attribute
  if (fill.dataset.value !== undefined) {
    return parseFloat(fill.dataset.value);
  }

  // Try aria-valuenow already set
  const existing = fill.getAttribute('aria-valuenow');
  if (existing) return parseFloat(existing);

  return null;
}

function remediateMeter(widget) {
  const cards = queryAll('.meter-card', widget);

  cards.forEach((card, i) => {
    setRole(card, 'group');
    ensureId(card, `meter-card-${i}`);

    const label = card.querySelector('.meter-label');
    const fill = card.querySelector('.meter-bar-fill');
    const text = card.querySelector('.meter-text');
    const min = card.dataset.min !== undefined ? parseFloat(card.dataset.min) : 0;
    const max = card.dataset.max !== undefined ? parseFloat(card.dataset.max) : 100;

    if (fill) {
      setRole(fill, 'meter');
      ensureId(fill, `meter-fill-${i}`);
      setAria(fill, 'valuemin', String(min));
      setAria(fill, 'valuemax', String(max));

      const value = extractValue(fill);
      if (value !== null) {
        setAria(fill, 'valuenow', String(value));
      }

      if (text) {
        setAria(fill, 'valuetext', text.textContent.trim());
      }

      if (label) {
        ensureId(label, `meter-label-${i}`);
        setAria(fill, 'labelledby', label.id);
      } else if (card.querySelector('.meter-label')) {
        const lbl = card.querySelector('.meter-label');
        ensureId(lbl, `meter-label-${i}`);
        setAria(fill, 'labelledby', lbl.id);
      }
    }

    if (label && fill) {
      labelledBy(fill, label);
    }
  });
}

export function apply() {
  const cleanups = [];

  const setup = (widget) => {
    remediateMeter(widget);

    const stop = observeChanges(widget, () => {
      remediateMeter(widget);
    });
    cleanups.push(stop);
  };

  const stopWatching = onElementAdded('.meter-widget', setup);
  cleanups.push(stopWatching);

  return () => cleanups.forEach((fn) => fn());
}
