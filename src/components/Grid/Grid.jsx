import { useState } from 'react';
import './Grid.css';

/**
 * Inaccessible Grid
 *
 * Accessibility issues:
 * 1. Built with divs, no role="grid"
 * 2. No role="row" on rows
 * 3. No role="gridcell" on cells
 * 4. No role="rowheader" or role="columnheader"
 * 5. No arrow key navigation between cells
 * 6. No Home/End, Ctrl+Home/Ctrl+End
 * 7. No focus management or roving tabindex
 * 8. No aria-colindex or aria-rowindex
 * 9. No aria-selected for cell selection
 * 10. No grid label
 */

const columns = ['Task', 'Assignee', 'Priority', 'Status', 'Due Date'];

const tasks = [
  ['Design landing page', 'Alice', 'High', 'In Progress', '2024-03-15'],
  ['API integration', 'Bob', 'High', 'Not Started', '2024-03-18'],
  ['Write unit tests', 'Carol', 'Medium', 'In Progress', '2024-03-20'],
  ['Database migration', 'David', 'High', 'Completed', '2024-03-12'],
  ['User research', 'Eva', 'Low', 'In Progress', '2024-03-25'],
  ['Bug fix: login flow', 'Frank', 'High', 'Not Started', '2024-03-14'],
  ['Update documentation', 'Grace', 'Low', 'Not Started', '2024-03-28'],
  ['Performance audit', 'Henry', 'Medium', 'Completed', '2024-03-10'],
];

export default function Grid() {
  const [selectedCell, setSelectedCell] = useState(null);

  return (
    <div className="grid-widget">
      <div className="grid-container">
        <div className="grid-header-row">
          {columns.map((col, ci) => (
            <div key={ci} className="grid-header-cell">{col}</div>
          ))}
        </div>
        <div className="grid-body">
          {tasks.map((row, ri) => (
            <div key={ri} className="grid-row">
              {row.map((cell, ci) => (
                <div
                  key={ci}
                  className={`grid-cell ${selectedCell === `${ri}-${ci}` ? 'selected' : ''}`}
                  onClick={() => setSelectedCell(`${ri}-${ci}`)}
                >
                  {ci === 2 && <span className={`priority-dot priority-${cell.toLowerCase()}`} />}
                  {ci === 3 && <span className={`status-tag status-${cell.toLowerCase().replace(/\s/g, '-')}`}>{cell}</span>}
                  {ci !== 3 && cell}
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
