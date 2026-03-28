/**
 * Post-render remediation for the Spinbutton component.
 *
 * Fixes attempted:
 * - Add role="spinbutton" to .spin-input (the value display element)
 * - Add aria-valuenow from the displayed numeric value
 * - Add aria-valuemin and aria-valuemax from data attributes or defaults
 * - Add aria-valuetext as a readable version of the value
 * - Add aria-label from .spin-label
 * - Add role="button" and aria-label to .spin-btn increment/decrement elements
 * - Add tabindex="0" and keyboard activation (Enter/Space) to spin buttons
 * - Add Up/Down arrow key handling on the spinbutton element
 * - Add Page Up/Down for larger step increments
 * - Add Home/End to jump to min/max values
 *
 * Limitations discovered:
 * - The spin-input element may be a read-only text display rather than a real
 *   <input type="number">; keyboard events on it dispatch custom events rather
 *   than modifying the input value directly
 * - aria-valuenow is read from the text content or data attribute; if the
 *   component renders a formatted string (e.g. "5 kg"), the numeric extraction
 *   may be imprecise
 * - The spin buttons (.spin-btn) are assumed to be increment (last) and
 *   decrement (first); this convention may not hold for all implementations
 */

import { setRole, setAria, setTabIndex, ensureId, labelledBy, dispatchChange } from '../lib/aria.js';
import { buttonify, onKeyDown } from '../lib/keyboard.js';
import { queryAll } from '../lib/dom.js';
import { createFix } from '../lib/fixFactory.js';

function parseValue(el) {
  if (el.dataset.value !== undefined) return parseFloat(el.dataset.value);
  const text = el.textContent.trim().replace(/[^0-9.-]/g, '');
  return parseFloat(text) || 0;
}

function remediateSpinbutton(widget) {
  const spinControls = queryAll('.spin-control', widget);

  spinControls.forEach((control, ci) => {
    const spinInput = control.querySelector('.spin-input');
    const spinButtons = queryAll('.spin-btn', control);
    const spinLabel = control.querySelector('.spin-label') ||
      widget.querySelector('.spin-label');

    const min = parseFloat(control.dataset.min ?? '-Infinity');
    const max = parseFloat(control.dataset.max ?? 'Infinity');
    const step = parseFloat(control.dataset.step ?? '1');

    if (spinInput) {
      const tag = spinInput.tagName.toLowerCase();
      if (tag !== 'input') {
        setRole(spinInput, 'spinbutton');
      }
      setTabIndex(spinInput, 0);
      ensureId(spinInput, `spin-input-${ci}`);

      const currentValue = parseValue(spinInput);
      setAria(spinInput, 'valuenow', String(currentValue));
      setAria(spinInput, 'valuetext', String(currentValue));

      if (isFinite(min)) setAria(spinInput, 'valuemin', String(min));
      if (isFinite(max)) setAria(spinInput, 'valuemax', String(max));

      if (spinLabel) {
        labelledBy(spinInput, spinLabel);
      }

      onKeyDown(spinInput, `spin-input-keys-${ci}`, (e) => {
        let newValue = parseValue(spinInput);
        const largeStep = Math.max(step * 10, Math.round((max - min) * 0.1));

        switch (e.key) {
          case 'ArrowUp':
            e.preventDefault();
            newValue = isFinite(max) ? Math.min(max, newValue + step) : newValue + step;
            break;
          case 'ArrowDown':
            e.preventDefault();
            newValue = isFinite(min) ? Math.max(min, newValue - step) : newValue - step;
            break;
          case 'PageUp':
            e.preventDefault();
            newValue = isFinite(max) ? Math.min(max, newValue + largeStep) : newValue + largeStep;
            break;
          case 'PageDown':
            e.preventDefault();
            newValue = isFinite(min) ? Math.max(min, newValue - largeStep) : newValue - largeStep;
            break;
          case 'Home':
            if (isFinite(min)) { e.preventDefault(); newValue = min; }
            break;
          case 'End':
            if (isFinite(max)) { e.preventDefault(); newValue = max; }
            break;
          default:
            return;
        }

        setAria(spinInput, 'valuenow', String(newValue));
        setAria(spinInput, 'valuetext', String(newValue));
        spinInput.dataset.value = String(newValue);

        dispatchChange(spinInput, 'spin-change', { value: newValue });
      });
    }

    spinButtons.forEach((btn, bi) => {
      buttonify(btn, `spin-btn-${ci}-${bi}`);

      if (!btn.getAttribute('aria-label')) {
        // First button is decrement, last is increment by convention
        const isDecrement = bi === 0 && spinButtons.length > 1;
        const label = isDecrement ? 'Decrease value' : 'Increase value';
        setAria(btn, 'label', label);
      }
    });
  });
}

export const apply = createFix('.spin-widget', remediateSpinbutton);
