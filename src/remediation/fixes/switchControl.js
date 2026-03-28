/**
 * Post-render remediation for the Switch Control component.
 *
 * Fixes attempted:
 * - Add role="switch" to each .switch-track element (the interactive control)
 * - Add aria-checked reflecting the on/off state (from .on class or data attribute)
 * - Add tabindex="0" to make the switch keyboard focusable
 * - Add Enter and Space key activation to toggle the switch state
 * - Associate visible label (.switch-name) with the switch via aria-labelledby
 * - Associate description (.switch-desc) via aria-describedby when present
 * - Group switch items within .switch-list using role="group" where appropriate
 * - Include the visible status text ("On"/"Off") in aria-checked announcement
 *   by hiding the redundant status span from AT (the switch role already
 *   conveys on/off state)
 *
 * Limitations discovered:
 * - The checked state is inferred from a CSS class (.on) on .switch-track or
 *   its parent .switch-item; this class must be in sync with React state
 * - Cannot use a real <input type="checkbox"> with switch semantics without
 *   modifying the React component source
 * - Space key must call e.preventDefault() to prevent page scroll, which
 *   differs from button behavior expectations in some AT
 * - The switch label (switch-name) may include a description suffix; full text
 *   content is used, which may be verbose when switch-desc is also present
 */

import { setRole, setAria, setTabIndex, ensureId } from '../lib/aria.js';
import { onKeyDown } from '../lib/keyboard.js';
import { queryAll } from '../lib/dom.js';
import { createFix } from '../lib/fixFactory.js';

function isSwitchOn(track) {
  if (track.classList.contains('on')) return true;
  if (track.dataset.on === 'true') return true;
  const parent = track.closest('.switch-item');
  if (parent && parent.classList.contains('on')) return true;
  return false;
}

function remediateSwitch(widget) {
  const switchList = widget.querySelector('.switch-list');
  if (switchList) {
    setRole(switchList, 'group');
    setAria(switchList, 'label', 'Settings');
  }

  const items = queryAll('.switch-item', widget);

  items.forEach((item, i) => {
    const track = item.querySelector('.switch-track') || item.querySelector('.switch-control');
    const name = item.querySelector('.switch-name');
    const desc = item.querySelector('.switch-desc');

    if (!track) return;

    setRole(track, 'switch');
    setTabIndex(track, 0);
    ensureId(track, `switch-${i}`);

    const isOn = isSwitchOn(track);
    setAria(track, 'checked', String(isOn));

    if (name) {
      ensureId(name, `switch-name-${i}`);
      setAria(track, 'labelledby', name.id);
    }

    if (desc) {
      ensureId(desc, `switch-desc-${i}`);
      setAria(track, 'describedby', desc.id);
    }

    // Hide the visible status text from AT since role="switch" + aria-checked
    // already conveys the on/off state; duplicate announcement is confusing
    const status = item.querySelector('.switch-status');
    if (status) {
      setAria(status, 'hidden', 'true');
    }

    onKeyDown(track, `switch-keys-${i}`, (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        track.click();
      }
    });
  });
}

export const apply = createFix('.switch-widget', remediateSwitch);
