/**
 * Post-render remediation for the Sortable Table component.
 *
 * Fixes attempted:
 * - Add role="table" to container, role="rowgroup", role="row", role="columnheader", role="cell"
 * - Add aria-label to describe the table
 * - Make sort triggers keyboard-accessible (button role, tabindex, Enter/Space)
 * - Add aria-sort to the currently sorted column header
 * - Announce sort changes via live region
 * - Add aria-roledescription for status badges
 *
 * Limitations discovered:
 * - ARIA table roles on divs are a poor substitute for semantic <table> elements.
 *   Many screen readers handle role="table" on divs inconsistently, especially
 *   for features like column/row header announcement during navigation.
 * - Cannot restructure divs into real <table>/<tr>/<th>/<td> without destroying
 *   React's DOM ownership and breaking future re-renders.
 * - Sort state detection relies on parsing the visual arrow characters (↑/↓/↕)
 *   from the DOM text, which is fragile.
 * - Status badges use color-only differentiation that cannot be fully remediated
 *   without injecting visible text or icons — CSS-only changes are insufficient
 *   for users who are both color-blind and not using a screen reader.
 * - Each sort click triggers a full re-render, requiring re-application of all fixes.
 */

import { setRole, setAria, setTabIndex, ensureId } from '../lib/aria.js';
import { makeClickable } from '../lib/keyboard.js';
import { queryAll } from '../lib/dom.js';
import { announce } from '../lib/announce.js';
import { observeChanges, onElementAdded } from '../lib/observer.js';
import { trackListener } from '../lib/tracker.js';

function remediateTable(widget) {
  const container = widget.querySelector('.table-container');
  if (!container) return;

  // Table structure roles
  setRole(container, 'table');
  setAria(container, 'label', 'Employee directory');

  const headerRow = container.querySelector('.table-header-row');
  const body = container.querySelector('.table-body');

  if (headerRow) {
    setRole(headerRow, 'row');
    // Wrap header row in a conceptual rowgroup
    setAria(headerRow, 'roledescription', 'column headers');
  }

  if (body) {
    setRole(body, 'rowgroup');
  }

  // Column headers and sort triggers
  const headerCells = queryAll('.table-header-cell', container);
  headerCells.forEach((cell, i) => {
    setRole(cell, 'columnheader');

    const trigger = cell.querySelector('.sort-trigger');
    if (trigger) {
      setRole(trigger, 'button');
      setTabIndex(trigger, 0);
      makeClickable(trigger, `sort-${i}`);

      // Detect current sort state from the arrow indicator
      const arrow = trigger.querySelector('.sort-arrow');
      if (arrow) {
        const text = arrow.textContent.trim();
        if (text === '↑') {
          setAria(cell, 'sort', 'ascending');
        } else if (text === '↓') {
          setAria(cell, 'sort', 'descending');
        } else {
          setAria(cell, 'sort', 'none');
        }
      }

      // Announce sort changes on click
      if (!trigger.__remSortHandler) {
        const sortHandler = () => {
          // Defer to let React update the DOM first
          requestAnimationFrame(() => {
            requestAnimationFrame(() => {
              const updatedArrow = trigger.querySelector('.sort-arrow');
              if (updatedArrow) {
                const dir = updatedArrow.textContent.trim();
                const colName = trigger.textContent.replace(dir, '').trim();
                const dirName = dir === '↑' ? 'ascending' : dir === '↓' ? 'descending' : '';
                if (dirName) {
                  announce(`Table sorted by ${colName}, ${dirName}`);
                }
              }
            });
          });
        };
        trigger.__remSortHandler = true;
        trigger.addEventListener('click', sortHandler);
        trackListener(trigger, `sortAnnounce-${i}`, 'click', sortHandler);
      }
    }
  });

  // Data rows and cells
  const rows = queryAll('.table-row', container);
  rows.forEach((row) => {
    setRole(row, 'row');
    const cells = queryAll('.table-cell', row);
    cells.forEach((cell) => {
      setRole(cell, 'cell');
    });

    // Add non-visual status text to color-coded badges
    const badge = row.querySelector('.status-badge');
    if (badge) {
      const status = badge.textContent.trim();
      // Status is already in the text, but ensure it's programmatically associated
      setAria(badge, 'label', `Status: ${status}`);
    }
  });
}

export function apply() {
  const cleanups = [];

  const setup = (widget) => {
    remediateTable(widget);

    const stop = observeChanges(widget, () => {
      remediateTable(widget);
    });
    cleanups.push(stop);
  };

  const stopWatching = onElementAdded('.table-widget', setup);
  cleanups.push(stopWatching);

  return () => cleanups.forEach((fn) => fn());
}
