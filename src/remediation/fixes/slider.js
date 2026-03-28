/**
 * Post-render remediation for the Slider component.
 *
 * Fixes attempted:
 * - Add role="slider" to .slider-thumb elements
 * - Add aria-valuenow from the thumb's current position (data attribute or CSS)
 * - Add aria-valuemin and aria-valuemax from the track's data attributes
 * - Add aria-valuetext as a formatted readable value
 * - Add aria-label from .slider-label or a data attribute
 * - Add tabindex="0" to make thumb keyboard focusable
 * - Add Left/Right arrow key handling to increment/decrement value
 * - Add Up/Down arrow keys as synonyms for horizontal sliders
 * - Add Home/End keys to jump to min/max
 * - Add Page Up/Down for larger step increments (10% of range)
 *
 * Limitations discovered:
 * - The thumb position is set by the React component via inline style or
 *   a data attribute; arrow key events call click handlers which may not
 *   exist on the div — a custom event dispatch is used as a fallback
 * - aria-valuenow must stay in sync with the actual thumb position; this fix
 *   reads the value at remediation time but relies on MutationObserver to
 *   re-apply when the component updates the DOM
 * - Page Up/Down step size is estimated as 10% of the range and may not
 *   match the application's defined large step
 */

import { setRole, setAria, setTabIndex, ensureId, labelledBy } from '../lib/aria.js';
import { onKeyDown } from '../lib/keyboard.js';
import { queryAll } from '../lib/dom.js';
import { observeChanges, onElementAdded } from '../lib/observer.js';

function getSliderValue(thumb) {
  if (thumb.dataset.value !== undefined) return parseFloat(thumb.dataset.value);
  const existing = thumb.getAttribute('aria-valuenow');
  if (existing) return parseFloat(existing);
  // Try to infer from left% style
  const style = thumb.style.left;
  if (style && style.endsWith('%')) return parseFloat(style);
  return 0;
}

function remediateSlider(widget) {
  const controls = queryAll('.slider-control', widget);

  controls.forEach((control, ci) => {
    const thumb = control.querySelector('.slider-thumb');
    const track = control.querySelector('.slider-track');
    const label = control.querySelector('.slider-label') ||
      widget.querySelector('.slider-label');
    const valueDisplay = control.querySelector('.slider-value');

    if (!thumb) return;

    const min = parseFloat(track?.dataset.min ?? control.dataset.min ?? '0');
    const max = parseFloat(track?.dataset.max ?? control.dataset.max ?? '100');
    const step = parseFloat(track?.dataset.step ?? control.dataset.step ?? '1');
    let currentValue = getSliderValue(thumb);

    setRole(thumb, 'slider');
    setTabIndex(thumb, 0);
    ensureId(thumb, `slider-thumb-${ci}`);
    setAria(thumb, 'valuemin', String(min));
    setAria(thumb, 'valuemax', String(max));
    setAria(thumb, 'valuenow', String(currentValue));

    if (valueDisplay) {
      setAria(thumb, 'valuetext', valueDisplay.textContent.trim());
    }

    if (label) {
      labelledBy(thumb, label);
    } else if (control.dataset.label) {
      setAria(thumb, 'label', control.dataset.label);
    }

    onKeyDown(thumb, `slider-keys-${ci}`, (e) => {
      let newValue = getSliderValue(thumb);
      const largeStep = Math.round((max - min) * 0.1);

      switch (e.key) {
        case 'ArrowRight':
        case 'ArrowUp':
          e.preventDefault();
          newValue = Math.min(max, newValue + step);
          break;
        case 'ArrowLeft':
        case 'ArrowDown':
          e.preventDefault();
          newValue = Math.max(min, newValue - step);
          break;
        case 'PageUp':
          e.preventDefault();
          newValue = Math.min(max, newValue + largeStep);
          break;
        case 'PageDown':
          e.preventDefault();
          newValue = Math.max(min, newValue - largeStep);
          break;
        case 'Home':
          e.preventDefault();
          newValue = min;
          break;
        case 'End':
          e.preventDefault();
          newValue = max;
          break;
        default:
          return;
      }

      // Update aria immediately for AT feedback
      setAria(thumb, 'valuenow', String(newValue));
      if (valueDisplay) {
        setAria(thumb, 'valuetext', String(newValue));
      }

      // Attempt to notify React by dispatching a custom input event
      thumb.dataset.value = String(newValue);
      thumb.dispatchEvent(new CustomEvent('slider-change', {
        bubbles: true,
        detail: { value: newValue },
      }));
    });
  });
}

export function apply() {
  const cleanups = [];

  const setup = (widget) => {
    remediateSlider(widget);

    const stop = observeChanges(widget, () => {
      remediateSlider(widget);
    });
    cleanups.push(stop);
  };

  const stopWatching = onElementAdded('.slider-widget', setup);
  cleanups.push(stopWatching);

  return () => cleanups.forEach((fn) => fn());
}
