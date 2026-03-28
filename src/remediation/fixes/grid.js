/**
 * Post-render remediation for the Grid component.
 *
 * Fixes attempted:
 * - Add role="grid" to .grid-container
 * - Add role="row" to header rows (.grid-header-row) and data rows (.grid-row)
 * - Add role="columnheader" to .grid-header-cell elements
 * - Add role="gridcell" to .grid-cell elements
 * - Add tabindex via roving tabindex pattern (one cell focusable at a time)
 * - Add aria-selected to cells/rows when selected
 * - Add arrow key navigation (Up/Down/Left/Right) between grid cells
 * - Add Home/End for start/end of row; Ctrl+Home/Ctrl+End for grid bounds
 *
 * Limitations discovered:
 * - Two-dimensional arrow navigation requires rebuilding the cell matrix on
 *   every re-render since React may reorder cells during state changes
 * - aria-selected on rows versus cells depends on whether the grid supports
 *   row-selection or cell-selection; we apply to rows by default
 * - Column sorting state (aria-sort) on column headers cannot be inferred
 *   without access to sort state; left unset to avoid incorrect values
 * - Ctrl+Home/End is a common grid pattern but may conflict with browser
 *   shortcuts on some platforms
 */

import { setRole, setAria, setTabIndex, ensureId } from '../lib/aria.js';
import { onKeyDown } from '../lib/keyboard.js';
import { rovingTabIndex } from '../lib/focus.js';
import { queryAll } from '../lib/dom.js';
import { observeChanges, onElementAdded } from '../lib/observer.js';

function buildCellMatrix(widget) {
  const rows = queryAll('.grid-header-row, .grid-row', widget);
  return rows.map((row) =>
    queryAll('.grid-header-cell, .grid-cell', row)
  );
}

function remediateGrid(widget) {
  const container = widget.querySelector('.grid-container');

  if (container) {
    setRole(container, 'grid');
    ensureId(container, 'grid-container');
  }

  const headerRows = queryAll('.grid-header-row', widget);
  headerRows.forEach((row) => {
    setRole(row, 'row');
    const cells = queryAll('.grid-header-cell', row);
    cells.forEach((cell) => {
      setRole(cell, 'columnheader');
      ensureId(cell, 'grid-hcell');
    });
  });

  const dataRows = queryAll('.grid-row', widget);
  dataRows.forEach((row, ri) => {
    setRole(row, 'row');
    ensureId(row, `grid-row-${ri}`);

    const isSelected = row.classList.contains('selected');
    setAria(row, 'selected', String(isSelected));

    const cells = queryAll('.grid-cell', row);
    cells.forEach((cell, ci) => {
      setRole(cell, 'gridcell');
      ensureId(cell, `grid-cell-${ri}-${ci}`);
    });
  });

  // Roving tabindex: only the first data cell is initially reachable
  const allCells = queryAll('.grid-cell', widget);
  if (allCells.length > 0) {
    rovingTabIndex(allCells, 0);
  }

  // 2D arrow key navigation
  if (container) {
    onKeyDown(container, 'gridArrowNav', (e) => {
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

      let nextRow = curRow;
      let nextCol = curCol;
      const isCtrl = e.ctrlKey || e.metaKey;

      switch (e.key) {
        case 'ArrowUp':
          nextRow = Math.max(0, curRow - 1);
          break;
        case 'ArrowDown':
          nextRow = Math.min(matrix.length - 1, curRow + 1);
          break;
        case 'ArrowLeft':
          nextCol = Math.max(0, curCol - 1);
          break;
        case 'ArrowRight':
          nextCol = Math.min((matrix[curRow]?.length ?? 1) - 1, curCol + 1);
          break;
        case 'Home':
          nextCol = isCtrl ? 0 : 0;
          if (isCtrl) nextRow = 0;
          break;
        case 'End':
          nextCol = isCtrl
            ? (matrix[matrix.length - 1]?.length ?? 1) - 1
            : (matrix[curRow]?.length ?? 1) - 1;
          if (isCtrl) nextRow = matrix.length - 1;
          break;
        default:
          return;
      }

      const target = matrix[nextRow]?.[nextCol];
      if (target && target !== current) {
        e.preventDefault();
        // Update roving tabindex
        const allFlat = matrix.flat();
        rovingTabIndex(allFlat, allFlat.indexOf(target));
        target.focus();
      }
    });
  }
}

export function apply() {
  const cleanups = [];

  const setup = (widget) => {
    remediateGrid(widget);

    const stop = observeChanges(widget, () => {
      remediateGrid(widget);
    });
    cleanups.push(stop);
  };

  const stopWatching = onElementAdded('.grid-widget', setup);
  cleanups.push(stopWatching);

  return () => cleanups.forEach((fn) => fn());
}
