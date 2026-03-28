/**
 * Post-render remediation for the RadioGroup component.
 *
 * Fixes attempted:
 * - Add role="radiogroup" to .radio-group containers
 * - Add aria-labelledby on each group pointing to .radio-group-title
 * - Add role="radio" to each .radio-circle element (the visual control)
 * - Add aria-checked reflecting selected state
 * - Add tabindex via roving tabindex (only selected or first item in tab sequence)
 * - Add Up/Down arrow key navigation with wrapping between radio options
 * - Add Space key to select the focused radio
 * - Associate visible label (.radio-name) with each radio via aria-labelledby
 * - Add aria-describedby linking to .radio-desc if present
 *
 * Limitations discovered:
 * - Cannot use real <input type="radio"> elements without breaking React's
 *   controlled component pattern
 * - Selected state is detected via .selected class on .radio-option; changes
 *   to selection must trigger a React re-render and MutationObserver re-apply
 * - Roving tabindex changes must be re-applied after each selection since
 *   React may re-render all option elements
 * - Home/End keys are not specified in ARIA for radiogroups (unlike listboxes)
 *   so they are intentionally omitted here
 */

import { setRole, setAria, setTabIndex, ensureId, labelledBy } from '../lib/aria.js';
import { onKeyDown } from '../lib/keyboard.js';
import { rovingTabIndex } from '../lib/focus.js';
import { queryAll } from '../lib/dom.js';
import { observeChanges, onElementAdded } from '../lib/observer.js';

function remediateRadioGroup(widget) {
  const groups = queryAll('.radio-group', widget);

  groups.forEach((group, gi) => {
    setRole(group, 'radiogroup');

    const groupTitle = group.querySelector('.radio-group-title') ||
      widget.querySelector('.radio-group-title');
    if (groupTitle) {
      labelledBy(group, groupTitle);
    }

    const options = queryAll('.radio-option', group);
    let activeIndex = 0;

    options.forEach((option, oi) => {
      const circle = option.querySelector('.radio-circle');
      const name = option.querySelector('.radio-name');
      const desc = option.querySelector('.radio-desc');

      if (!circle) return;

      setRole(circle, 'radio');
      ensureId(circle, `radio-${gi}-${oi}`);

      const isSelected = option.classList.contains('selected');
      setAria(circle, 'checked', String(isSelected));

      if (isSelected) activeIndex = oi;

      if (name) {
        ensureId(name, `radio-name-${gi}-${oi}`);
        setAria(circle, 'labelledby', name.id);
      }

      if (desc) {
        ensureId(desc, `radio-desc-${gi}-${oi}`);
        setAria(circle, 'describedby', desc.id);
      }
    });

    // Roving tabindex — only the selected (or first) item is tabbable
    const circles = options.map((opt) => opt.querySelector('.radio-circle')).filter(Boolean);
    rovingTabIndex(circles, activeIndex);

    // Arrow key navigation
    onKeyDown(group, `radiogroup-nav-${gi}`, (e) => {
      const opts = queryAll('.radio-option', group);
      const circs = opts.map((opt) => opt.querySelector('.radio-circle')).filter(Boolean);
      if (circs.length === 0) return;

      const current = document.activeElement;
      const idx = circs.indexOf(current);
      if (idx === -1) return;

      let next = idx;

      if (e.key === 'ArrowDown' || e.key === 'ArrowRight') {
        e.preventDefault();
        next = (idx + 1) % circs.length;
      } else if (e.key === 'ArrowUp' || e.key === 'ArrowLeft') {
        e.preventDefault();
        next = (idx - 1 + circs.length) % circs.length;
      } else if (e.key === ' ') {
        e.preventDefault();
        circs[idx].click();
        return;
      } else {
        return;
      }

      rovingTabIndex(circs, next);
      circs[next].focus();
      // Trigger selection
      circs[next].click();
    });
  });
}

export function apply() {
  const cleanups = [];

  const setup = (widget) => {
    remediateRadioGroup(widget);

    const stop = observeChanges(widget, () => {
      remediateRadioGroup(widget);
    });
    cleanups.push(stop);
  };

  const stopWatching = onElementAdded('.radio-widget', setup);
  cleanups.push(stopWatching);

  return () => cleanups.forEach((fn) => fn());
}
