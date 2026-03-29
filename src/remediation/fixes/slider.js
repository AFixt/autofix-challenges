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
 * - Keyboard value changes are applied by simulating a mousedown on the
 *   slider track at the calculated pixel position for the new value. This
 *   triggers the component's real mouse handler and updates React state,
 *   but it couples the fix to the component's mouse-based interaction model
 *   and layout math. If the component switches to pointer events or changes
 *   its position calculation, the simulation breaks silently.
 * - aria-valuenow must stay in sync with the actual thumb position; this fix
 *   reads the value at remediation time but relies on MutationObserver to
 *   re-apply when the component updates the DOM
 * - Page Up/Down step size is estimated as 10% of the range and may not
 *   match the application's defined large step
 */

import { setRole, setAria, setTabIndex, ensureId, labelledBy, extractValue } from '../lib/aria.js';
import { onKeyDown } from '../lib/keyboard.js';
import { queryAll, simulateMouseEvent, valueToClientX } from '../lib/dom.js';
import { createFix } from '../lib/fixFactory.js';

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
    let currentValue = extractValue(thumb, 'left', 0);

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
      let newValue = extractValue(thumb, 'left', 0);
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

      // Simulate a mousedown on the track at the position corresponding to
      // the new value. The component's handleMouseDown calls update(e)
      // immediately, which reads clientX to compute the new value and calls
      // React's onChange — updating real component state.
      if (track) {
        const clientX = valueToClientX(track, newValue, min, max);
        const rect = track.getBoundingClientRect();
        simulateMouseEvent(track, 'mousedown', clientX, rect.top + rect.height / 2);
        simulateMouseEvent(document, 'mouseup', clientX, rect.top + rect.height / 2);
      }
    });
  });
}

export const apply = createFix('.slider-widget', remediateSlider);
