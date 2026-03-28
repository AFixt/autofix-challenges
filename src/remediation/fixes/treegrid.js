/**
 * Post-render remediation for the Treegrid component.
 *
 * Fixes attempted:
 * - Add role="treegrid" to .tg-container
 * - Add role="row" to .tg-header and .tg-row elements
 * - Add role="columnheader" to .tg-hcell elements
 * - Add role="gridcell" to .tg-cell elements
 * - Add role="rowheader" to the first .tg-cell (name cell) within each row
 * - Add aria-expanded to rows that have child rows, reflecting open/close state
 * - Add aria-level to rows based on their nesting depth
 * - Add tabindex via roving tabindex across all gridcells
 * - Add Up/Down/Left/Right arrow key navigation
 * - Left arrow on an expanded row collapses it; on a collapsed row moves to parent
 * - Right arrow on a collapsed row expands it; on a cell moves right
 * - Add Home/End for first/last cell in current row
 * - Add Ctrl+Home/Ctrl+End for first/last cell in entire grid
 *
 * Limitations discovered:
 * - Nesting depth (aria-level) is inferred from indentation data attributes or
 *   DOM nesting; if rows are rendered flat with CSS indentation only, the level
 *   will default to 1 for all rows
 * - Expand/collapse is triggered via .click() on the .tg-chevron element; if
 *   the component uses a different interaction pattern this will not work
 * - Two-dimensional navigation requires rebuilding the full cell matrix after
 *   each row expand/collapse, which happens via MutationObserver re-apply
 */

import { setRole, setAria, setTabIndex, ensureId } from '../lib/aria.js';
import { onKeyDown } from '../lib/keyboard.js';
import { rovingTabIndex } from '../lib/focus.js';
import { queryAll } from '../lib/dom.js';
import { observeChanges, onElementAdded } from '../lib/observer.js';

function getRowLevel(row) {
  if (row.dataset.level) return parseInt(row.dataset.level, 10);
  // Try to infer from ancestor rows
  let level = 1;
  let el = row.parentElement;
  while (el) {
    if (el.classList.contains('tg-row')) level++;
    el = el.parentElement;
  }
  return level;
}

function buildCellMatrix(widget) {
  const rows = queryAll('.tg-header, .tg-row', widget);
  return rows.map((row) =>
    queryAll('.tg-hcell, .tg-cell', row)
  );
}

function remediateTreegrid(widget) {
  const container = widget.querySelector('.tg-container');
  if (!container) return;

  setRole(container, 'treegrid');
  ensureId(container, 'treegrid-container');

  // Header row
  const header = widget.querySelector('.tg-header');
  if (header) {
    setRole(header, 'row');
    const hcells = queryAll('.tg-hcell', header);
    hcells.forEach((cell) => {
      setRole(cell, 'columnheader');
      ensureId(cell, 'tg-hcell');
    });
  }

  // Data rows
  const rows = queryAll('.tg-row', widget);
  rows.forEach((row, ri) => {
    setRole(row, 'row');
    ensureId(row, `tg-row-${ri}`);

    const level = getRowLevel(row);
    setAria(row, 'level', String(level));

    const chevron = row.querySelector('.tg-chevron');
    const hasChildren = row.dataset.hasChildren === 'true' || !!chevron;

    if (hasChildren) {
      const isExpanded = row.classList.contains('expanded') ||
        row.dataset.expanded === 'true';
      setAria(row, 'expanded', String(isExpanded));
    }

    const cells = queryAll('.tg-cell', row);
    cells.forEach((cell, ci) => {
      if (ci === 0) {
        setRole(cell, 'rowheader');
      } else {
        setRole(cell, 'gridcell');
      }
      ensureId(cell, `tg-cell-${ri}-${ci}`);
    });
  });

  // Roving tabindex — first cell starts focusable
  const allCells = queryAll('.tg-cell', widget);
  if (allCells.length > 0) {
    rovingTabIndex(allCells, 0);
  }

  onKeyDown(container, 'treegridNav', (e) => {
    const matrix = buildCellMatrix(widget);
    if (matrix.length === 0) return;

    const current = document.activeElement;
    let curRow = -1;
    let curCol = -1;

    outer:
    for (let r = 0; r < matrix.length; r++) {
      for (let c = 0; c < matrix[r].length; c++) {
        if (matrix[r][c] === current) {
          curRow = r;
          curCol = c;
          break outer;
        }
      }
    }

    if (curRow === -1) return;

    const isCtrl = e.ctrlKey || e.metaKey;
    let nextRow = curRow;
    let nextCol = curCol;

    const dataRows = queryAll('.tg-row', widget);
    const currentDomRow = current?.closest('.tg-row');

    switch (e.key) {
      case 'ArrowUp':
        e.preventDefault();
        nextRow = Math.max(0, curRow - 1);
        break;
      case 'ArrowDown':
        e.preventDefault();
        nextRow = Math.min(matrix.length - 1, curRow + 1);
        break;
      case 'ArrowRight':
        e.preventDefault();
        if (curCol < (matrix[curRow]?.length ?? 1) - 1) {
          nextCol = curCol + 1;
        } else if (currentDomRow) {
          const isExpanded = currentDomRow.getAttribute('aria-expanded') === 'true';
          if (!isExpanded && currentDomRow.getAttribute('aria-expanded') !== null) {
            const chevron = currentDomRow.querySelector('.tg-chevron');
            if (chevron) chevron.click();
          }
        }
        break;
      case 'ArrowLeft':
        e.preventDefault();
        if (curCol > 0) {
          nextCol = curCol - 1;
        } else if (currentDomRow) {
          const isExpanded = currentDomRow.getAttribute('aria-expanded') === 'true';
          if (isExpanded) {
            const chevron = currentDomRow.querySelector('.tg-chevron');
            if (chevron) chevron.click();
          }
        }
        break;
      case 'Home':
        e.preventDefault();
        nextCol = 0;
        if (isCtrl) nextRow = 0;
        break;
      case 'End':
        e.preventDefault();
        nextCol = (matrix[curRow]?.length ?? 1) - 1;
        if (isCtrl) {
          nextRow = matrix.length - 1;
          nextCol = (matrix[nextRow]?.length ?? 1) - 1;
        }
        break;
      default:
        return;
    }

    const target = matrix[nextRow]?.[nextCol];
    if (target && target !== current) {
      const allFlat = matrix.flat();
      rovingTabIndex(allFlat, allFlat.indexOf(target));
      target.focus();
    }
  });
}

export function apply() {
  const cleanups = [];

  const setup = (widget) => {
    remediateTreegrid(widget);

    const stop = observeChanges(widget, () => {
      remediateTreegrid(widget);
    });
    cleanups.push(stop);
  };

  const stopWatching = onElementAdded('.treegrid-widget', setup);
  cleanups.push(stopWatching);

  return () => cleanups.forEach((fn) => fn());
}
