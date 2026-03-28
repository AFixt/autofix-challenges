/**
 * Post-render remediation for the Toolbar component.
 *
 * Fixes attempted:
 * - Add role="toolbar" to .toolbar element
 * - Add aria-label to the toolbar for identification
 * - Add role="button" and tabindex to .toolbar-btn elements that are not <button>
 * - Add aria-pressed to toggle buttons (those with .active class)
 * - Add aria-disabled to disabled buttons (.disabled class)
 * - Add role="group" and aria-label to .toolbar-group separator groups
 * - Add Enter/Space keyboard activation to non-button toolbar items
 * - Add Left/Right arrow key navigation with roving tabindex
 * - Add Home/End to jump to first/last toolbar item
 * - Skip disabled buttons during arrow key navigation
 *
 * Limitations discovered:
 * - Toolbar items may be a mix of buttons, dropdowns, and non-interactive
 *   separators; only .toolbar-btn items participate in roving tabindex
 * - aria-pressed state mirrors .active CSS class which must be kept in sync
 *   with React state; re-renders may briefly show stale values
 * - Vertical toolbars (if orientation is set) would require Up/Down arrow keys
 *   instead; orientation is not currently detected and defaults to horizontal
 * - Groups within a toolbar are identified by .toolbar-group only; implicit
 *   grouping via visual whitespace cannot be remediated
 */

import { setRole, setAria, setTabIndex, ensureId } from '../lib/aria.js';
import { makeClickable, onKeyDown } from '../lib/keyboard.js';
import { rovingTabIndex } from '../lib/focus.js';
import { queryAll } from '../lib/dom.js';
import { observeChanges, onElementAdded } from '../lib/observer.js';

function remediateToolbar(widget) {
  const toolbar = widget.querySelector('.toolbar');
  if (!toolbar) return;

  setRole(toolbar, 'toolbar');
  ensureId(toolbar, 'toolbar');

  if (!toolbar.getAttribute('aria-label') && !toolbar.getAttribute('aria-labelledby')) {
    setAria(toolbar, 'label', toolbar.dataset.label || 'Toolbar');
  }

  const groups = queryAll('.toolbar-group', toolbar);
  groups.forEach((group, gi) => {
    setRole(group, 'group');
    if (!group.getAttribute('aria-label')) {
      setAria(group, 'label', group.dataset.label || `Group ${gi + 1}`);
    }
  });

  const buttons = queryAll('.toolbar-btn', toolbar);

  buttons.forEach((btn, bi) => {
    const tag = btn.tagName.toLowerCase();
    if (tag !== 'button') {
      setRole(btn, 'button');
      makeClickable(btn, `toolbar-btn-${bi}`);
    }

    const isActive = btn.classList.contains('active');
    const isDisabled = btn.classList.contains('disabled');

    setAria(btn, 'pressed', String(isActive));

    if (isDisabled) {
      setAria(btn, 'disabled', 'true');
    }
  });

  // Roving tabindex — first non-disabled button starts with tabindex=0
  const focusableBtns = buttons.filter((b) => !b.classList.contains('disabled'));
  if (focusableBtns.length > 0) {
    rovingTabIndex(focusableBtns, 0);
    // Also ensure all disabled buttons are removed from tab sequence
    buttons.filter((b) => b.classList.contains('disabled')).forEach((b) => {
      setTabIndex(b, -1);
    });
  }

  onKeyDown(toolbar, 'toolbarArrowNav', (e) => {
    const btns = queryAll('.toolbar-btn:not(.disabled)', toolbar);
    if (btns.length === 0) return;

    const current = document.activeElement;
    const idx = btns.indexOf(current);
    if (idx === -1) return;

    let next = idx;

    switch (e.key) {
      case 'ArrowRight':
        e.preventDefault();
        next = (idx + 1) % btns.length;
        break;
      case 'ArrowLeft':
        e.preventDefault();
        next = (idx - 1 + btns.length) % btns.length;
        break;
      case 'Home':
        e.preventDefault();
        next = 0;
        break;
      case 'End':
        e.preventDefault();
        next = btns.length - 1;
        break;
      default:
        return;
    }

    rovingTabIndex(btns, next);
    btns[next].focus();
  });
}

export function apply() {
  const cleanups = [];

  const setup = (widget) => {
    remediateToolbar(widget);

    const stop = observeChanges(widget, () => {
      remediateToolbar(widget);
    });
    cleanups.push(stop);
  };

  const stopWatching = onElementAdded('.toolbar-widget', setup);
  cleanups.push(stopWatching);

  return () => cleanups.forEach((fn) => fn());
}
