/**
 * Post-render remediation for the Combobox component.
 *
 * Fixes attempted:
 * - Add role="combobox" to the input element
 * - Add aria-expanded reflecting listbox open/closed state
 * - Add aria-controls linking the input to the listbox
 * - Add aria-autocomplete="list" to the input
 * - Add role="listbox" to the dropdown container
 * - Add role="option" and aria-selected to each option item
 * - Add aria-activedescendant on the input pointing to the focused option
 * - Add Up/Down arrow key navigation between options
 * - Add Escape key to close the listbox and return focus to the input
 * - Associate visible label with the input via aria-labelledby
 *
 * Limitations discovered:
 * - React controls input value and listbox visibility through state; keyboard
 *   handler can only synthesize arrow-key navigation if the component exposes
 *   a click handler on each option — focus cannot be moved into the listbox
 *   without triggering React's synthetic event system
 * - aria-activedescendant must be set on the input (not the listbox), so the
 *   screen reader virtual cursor stays on the input while options are navigated
 * - Escape key dismissal works only if the component has a click-outside-to-close
 *   handler, since we cannot directly set state
 */

import { setRole, setAria, setTabIndex, ensureId, labelledBy, controls } from '../lib/aria.js';
import { onKeyDown } from '../lib/keyboard.js';
import { queryAll } from '../lib/dom.js';
import { createFix } from '../lib/fixFactory.js';

function remediateCombobox(widget) {
  const input = widget.querySelector('.combobox-input');
  const listbox = widget.querySelector('.combobox-listbox');
  const labelText = widget.querySelector('.combobox-label-text');
  const options = queryAll('.combobox-option', widget);

  if (input) {
    setRole(input, 'combobox');
    setAria(input, 'autocomplete', 'list');
    setAria(input, 'haspopup', 'listbox');

    const isExpanded = listbox
      ? window.getComputedStyle(listbox).display !== 'none' &&
        !listbox.hidden
      : false;
    setAria(input, 'expanded', String(isExpanded));

    if (listbox) {
      controls(input, listbox);
    }

    if (labelText) {
      labelledBy(input, labelText);
    }
  }

  if (listbox) {
    setRole(listbox, 'listbox');
    ensureId(listbox, 'combobox-listbox');

    if (labelText) {
      labelledBy(listbox, labelText);
    }
  }

  options.forEach((option, i) => {
    setRole(option, 'option');
    ensureId(option, `combobox-option-${i}`);
    const isSelected = option.classList.contains('selected') ||
      option.getAttribute('aria-selected') === 'true';
    setAria(option, 'selected', String(isSelected));
    setTabIndex(option, -1);
  });

  // Arrow key navigation within the listbox
  if (listbox && options.length > 0) {
    onKeyDown(listbox, 'comboboxArrowNav', (e) => {
      const opts = queryAll('.combobox-option', listbox);
      if (opts.length === 0) return;

      const current = document.activeElement;
      const idx = opts.indexOf(current);

      if (e.key === 'ArrowDown') {
        e.preventDefault();
        const next = idx === -1 ? 0 : Math.min(idx + 1, opts.length - 1);
        opts[next].focus();
        if (input) {
          setAria(input, 'activedescendant', opts[next].id);
        }
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        const prev = idx <= 0 ? 0 : idx - 1;
        opts[prev].focus();
        if (input) {
          setAria(input, 'activedescendant', opts[prev].id);
        }
      } else if (e.key === 'Escape') {
        e.preventDefault();
        if (input) {
          input.focus();
          setAria(input, 'expanded', 'false');
          setAria(input, 'activedescendant', '');
        }
      }
    });
  }

  if (input && listbox) {
    onKeyDown(input, 'comboboxInputNav', (e) => {
      const opts = queryAll('.combobox-option', listbox);
      if (e.key === 'ArrowDown' && opts.length > 0) {
        e.preventDefault();
        opts[0].focus();
        setAria(input, 'activedescendant', opts[0].id);
      } else if (e.key === 'Escape') {
        setAria(input, 'expanded', 'false');
        setAria(input, 'activedescendant', '');
      }
    });
  }
}

export const apply = createFix('.combobox-widget', remediateCombobox);
