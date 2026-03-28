/**
 * Post-render remediation for the Checkbox component.
 *
 * Fixes attempted:
 * - Add role="checkbox" to each .checkbox-box element
 * - Add aria-checked reflecting .checked and .mixed class state
 * - Add tabindex="0" and keyboard activation (Enter/Space toggles click)
 * - Add role="group" and aria-labelledby to .checkbox-group containers
 * - Add aria-controls on the select-all checkbox linking to individual checkboxes
 * - Associate visible label text (.checkbox-text) via aria-labelledby
 *
 * Limitations discovered:
 * - The mixed (indeterminate) state is detected via .mixed class, which must be
 *   kept in sync by the application; if React clears the class mid-render,
 *   aria-checked will momentarily be incorrect
 * - aria-controls on a single element pointing to multiple IDs requires all
 *   target IDs to exist at remediation time; dynamically added items will be
 *   missed until MutationObserver fires
 * - Cannot add a real <input type="checkbox"> without breaking React's
 *   controlled-component binding
 */

import { setRole, setAria, setTabIndex, ensureId, labelledBy } from '../lib/aria.js';
import { makeClickable } from '../lib/keyboard.js';
import { queryAll } from '../lib/dom.js';
import { createFix } from '../lib/fixFactory.js';

function remediateCheckbox(widget) {
  const groups = queryAll('.checkbox-group', widget);

  groups.forEach((group, gi) => {
    setRole(group, 'group');

    const groupTitle = group.querySelector('.checkbox-group-title') ||
      group.closest('.checkbox-widget')?.querySelector('.checkbox-group-title');
    if (groupTitle) {
      labelledBy(group, groupTitle);
    }

    const selectAll = group.querySelector('.select-all');
    const items = queryAll('.checkbox-item', group);
    const boxIds = [];

    items.forEach((item, ii) => {
      const box = item.querySelector('.checkbox-box');
      const label = item.querySelector('.checkbox-text');

      if (!box) return;

      const boxId = ensureId(box, `checkbox-${gi}-${ii}`);
      boxIds.push(boxId);

      setRole(box, 'checkbox');
      setTabIndex(box, 0);

      const isMixed = box.classList.contains('mixed');
      const isChecked = box.classList.contains('checked');
      setAria(box, 'checked', isMixed ? 'mixed' : String(isChecked));

      if (label) {
        labelledBy(box, label);
      }

      makeClickable(box, `checkbox-click-${gi}-${ii}`);
    });

    if (selectAll) {
      const saBox = selectAll.querySelector('.checkbox-box') || selectAll;
      ensureId(saBox, `checkbox-selectall-${gi}`);
      setRole(saBox, 'checkbox');
      setTabIndex(saBox, 0);

      const isMixed = saBox.classList.contains('mixed');
      const isChecked = saBox.classList.contains('checked');
      setAria(saBox, 'checked', isMixed ? 'mixed' : String(isChecked));

      if (boxIds.length > 0) {
        setAria(saBox, 'controls', boxIds.join(' '));
      }

      const saLabel = selectAll.querySelector('.checkbox-text');
      if (saLabel) {
        labelledBy(saBox, saLabel);
      }

      makeClickable(saBox, `checkbox-selectall-click-${gi}`);
    }
  });

  // Also handle top-level items outside a group
  const ungroupedItems = queryAll('.checkbox-widget > .checkbox-item', widget);
  ungroupedItems.forEach((item, i) => {
    const box = item.querySelector('.checkbox-box');
    const label = item.querySelector('.checkbox-text');

    if (!box) return;

    ensureId(box, `checkbox-top-${i}`);
    setRole(box, 'checkbox');
    setTabIndex(box, 0);

    const isMixed = box.classList.contains('mixed');
    const isChecked = box.classList.contains('checked');
    setAria(box, 'checked', isMixed ? 'mixed' : String(isChecked));

    if (label) {
      labelledBy(box, label);
    }

    makeClickable(box, `checkbox-top-click-${i}`);
  });
}

export const apply = createFix('.checkbox-widget', remediateCheckbox);
