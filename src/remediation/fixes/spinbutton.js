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
 * - Keyboard value changes are applied by simulating clicks on the
 *   increment/decrement buttons. This triggers the component's real onClick
 *   handlers and updates React state, but for multi-step changes (Page Up/Down,
 *   Home/End) multiple clicks must be simulated in sequence, and the fix is
 *   coupled to the button ordering convention (first = decrement, last = increment).
 * - aria-valuenow is read from the text content or data attribute; if the
 *   component renders a formatted string (e.g. "5 kg"), the numeric extraction
 *   may be imprecise
 * - The spin buttons (.spin-btn) are assumed to be increment (last) and
 *   decrement (first); this convention may not hold for all implementations
 */

import { setRole, setAria, setTabIndex, ensureId, labelledBy } from '../lib/aria.js';
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

      // Identify increment/decrement buttons by convention: first = dec, last = inc
      const decBtn = spinButtons.length > 1 ? spinButtons[0] : null;
      const incBtn = spinButtons.length > 0 ? spinButtons[spinButtons.length - 1] : null;

      onKeyDown(spinInput, `spin-input-keys-${ci}`, (e) => {
        const currentValue = parseValue(spinInput);
        const largeStep = Math.max(step * 10, Math.round((max - min) * 0.1));
        let clicks = 0;
        let btn = null;

        switch (e.key) {
          case 'ArrowUp':
            e.preventDefault();
            btn = incBtn;
            clicks = 1;
            break;
          case 'ArrowDown':
            e.preventDefault();
            btn = decBtn;
            clicks = 1;
            break;
          case 'PageUp':
            e.preventDefault();
            btn = incBtn;
            clicks = Math.round(largeStep / step);
            break;
          case 'PageDown':
            e.preventDefault();
            btn = decBtn;
            clicks = Math.round(largeStep / step);
            break;
          case 'Home':
            if (isFinite(min)) {
              e.preventDefault();
              btn = decBtn;
              clicks = Math.round((currentValue - min) / step);
            }
            break;
          case 'End':
            if (isFinite(max)) {
              e.preventDefault();
              btn = incBtn;
              clicks = Math.round((max - currentValue) / step);
            }
            break;
          default:
            return;
        }

        // Simulate clicks on the real increment/decrement buttons to
        // trigger React's onClick handlers and update component state.
        if (btn && clicks > 0) {
          for (let i = 0; i < clicks; i++) {
            btn.click();
          }
        }
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
