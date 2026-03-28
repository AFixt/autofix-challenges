/**
 * Post-render remediation for the Multi-Thumb Slider component.
 *
 * Fixes attempted:
 * - Add role="slider" to each .mts-thumb element
 * - Add aria-valuenow, aria-valuemin, aria-valuemax to each thumb
 * - Differentiate min/max thumb labels:
 *     - First thumb: aria-label "Minimum value" (or from .mts-label[data-for="min"])
 *     - Second thumb: aria-label "Maximum value" (or from .mts-label[data-for="max"])
 * - Add tabindex="0" to both thumbs
 * - Add Left/Right/Up/Down arrow keys for each thumb independently
 * - Add Home/End keys for each thumb (constrained by the other thumb's value)
 * - Constrain min thumb to not exceed max thumb value and vice versa
 *
 * Limitations discovered:
 * - Constraining thumb values requires knowing both thumb positions at keypress
 *   time; if React updates positions asynchronously the constraint check may
 *   use stale values
 * - aria-valuetext uses numeric values; a human-readable formatted label
 *   (e.g. "$50 – $200") is not possible without knowledge of the value format
 * - The Page Up/Down large step is estimated as 10% of the total range; the
 *   actual application step size may differ
 * - Only two thumbs are assumed; a variable-thumb slider would require a more
 *   dynamic approach
 */

import { setRole, setAria, setTabIndex, ensureId, extractValue, dispatchChange } from '../lib/aria.js';
import { onKeyDown } from '../lib/keyboard.js';
import { queryAll } from '../lib/dom.js';
import { createFix } from '../lib/fixFactory.js';

function remediateMultiThumbSlider(widget) {
  const controls = queryAll('.mts-control', widget);

  controls.forEach((control, ci) => {
    const track = control.querySelector('.mts-track');
    const thumbs = queryAll('.mts-thumb', control);
    const labels = queryAll('.mts-label', control);

    if (thumbs.length === 0) return;

    const min = parseFloat(track?.dataset.min ?? control.dataset.min ?? '0');
    const max = parseFloat(track?.dataset.max ?? control.dataset.max ?? '100');
    const step = parseFloat(track?.dataset.step ?? control.dataset.step ?? '1');
    const largeStep = Math.round((max - min) * 0.1);

    const thumbLabels = ['Minimum value', 'Maximum value'];

    thumbs.forEach((thumb, ti) => {
      setRole(thumb, 'slider');
      setTabIndex(thumb, 0);
      ensureId(thumb, `mts-thumb-${ci}-${ti}`);
      setAria(thumb, 'valuemin', String(min));
      setAria(thumb, 'valuemax', String(max));

      const currentValue = extractValue(thumb, 'left', 0);
      setAria(thumb, 'valuenow', String(currentValue));
      setAria(thumb, 'valuetext', String(currentValue));

      // Label from explicit .mts-label or fallback
      const matchingLabel = labels.find(
        (l) =>
          l.dataset.for === (ti === 0 ? 'min' : 'max') ||
          l.dataset.index === String(ti)
      );

      if (matchingLabel) {
        ensureId(matchingLabel, `mts-label-${ci}-${ti}`);
        setAria(thumb, 'labelledby', matchingLabel.id);
      } else {
        setAria(thumb, 'label', thumbLabels[ti] ?? `Slider thumb ${ti + 1}`);
      }

      onKeyDown(thumb, `mts-keys-${ci}-${ti}`, (e) => {
        let newValue = extractValue(thumb, 'left', 0);

        // Get sibling thumb value for constraint
        const siblingThumb = thumbs[ti === 0 ? 1 : 0];
        const siblingValue = siblingThumb ? extractValue(siblingThumb, 'left', 0) : null;

        const effectiveMin = ti === 0 ? min : (siblingValue !== null ? siblingValue : min);
        const effectiveMax = ti === 1 ? max : (siblingValue !== null ? siblingValue : max);

        switch (e.key) {
          case 'ArrowRight':
          case 'ArrowUp':
            e.preventDefault();
            newValue = Math.min(effectiveMax, newValue + step);
            break;
          case 'ArrowLeft':
          case 'ArrowDown':
            e.preventDefault();
            newValue = Math.max(effectiveMin, newValue - step);
            break;
          case 'PageUp':
            e.preventDefault();
            newValue = Math.min(effectiveMax, newValue + largeStep);
            break;
          case 'PageDown':
            e.preventDefault();
            newValue = Math.max(effectiveMin, newValue - largeStep);
            break;
          case 'Home':
            e.preventDefault();
            newValue = effectiveMin;
            break;
          case 'End':
            e.preventDefault();
            newValue = effectiveMax;
            break;
          default:
            return;
        }

        setAria(thumb, 'valuenow', String(newValue));
        setAria(thumb, 'valuetext', String(newValue));
        thumb.dataset.value = String(newValue);

        dispatchChange(thumb, 'mts-change', { value: newValue, index: ti });
      });
    });
  });
}

export const apply = createFix('.mts-widget', remediateMultiThumbSlider);
