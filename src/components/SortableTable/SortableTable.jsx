import { useState } from 'react';
import './SortableTable.css';

/**
 * Inaccessible Sortable Table
 *
 * Accessibility issues:
 * 1. Built with <div>s instead of semantic <table>, <thead>, <tbody>, <tr>, <th>, <td>
 * 2. No <caption> or aria-label describing the table
 * 3. Sort triggers are <span>s, not <button>s (not keyboard accessible)
 * 4. No aria-sort attribute on sorted columns
 * 5. No scope attributes on headers
 * 6. No relationship between headers and data cells
 * 7. Sort direction indicator is purely visual (arrow character)
 * 8. No live region to announce sort changes to screen readers
 * 9. Status badges use color alone to convey meaning
 * 10. No row/column header associations
 */

const initialData = [
  { id: 1, name: 'Alice Chen', department: 'Engineering', status: 'Active', salary: 125000, startDate: '2021-03-15' },
  { id: 2, name: 'Bob Martinez', department: 'Marketing', status: 'Active', salary: 95000, startDate: '2020-07-22' },
  { id: 3, name: 'Carol Williams', department: 'Engineering', status: 'On Leave', salary: 118000, startDate: '2019-11-08' },
  { id: 4, name: 'David Kim', department: 'Sales', status: 'Active', salary: 105000, startDate: '2022-01-10' },
  { id: 5, name: 'Eva Johnson', department: 'Design', status: 'Inactive', salary: 98000, startDate: '2020-05-30' },
  { id: 6, name: 'Frank Brown', department: 'Engineering', status: 'Active', salary: 132000, startDate: '2018-09-14' },
  { id: 7, name: 'Grace Lee', department: 'Marketing', status: 'Active', salary: 87000, startDate: '2023-02-01' },
  { id: 8, name: 'Henry Davis', department: 'Sales', status: 'On Leave', salary: 110000, startDate: '2021-06-18' },
];

const columns = [
  { key: 'name', label: 'Employee Name' },
  { key: 'department', label: 'Department' },
  { key: 'status', label: 'Status' },
  { key: 'salary', label: 'Salary' },
  { key: 'startDate', label: 'Start Date' },
];

export default function SortableTable() {
  const [data, setData] = useState(initialData);
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' });

  const handleSort = (key) => {
    const direction =
      sortConfig.key === key && sortConfig.direction === 'asc' ? 'desc' : 'asc';

    const sorted = [...data].sort((a, b) => {
      if (a[key] < b[key]) return direction === 'asc' ? -1 : 1;
      if (a[key] > b[key]) return direction === 'asc' ? 1 : -1;
      return 0;
    });

    setSortConfig({ key, direction });
    setData(sorted);
  };

  const formatSalary = (value) =>
    '$' + value.toLocaleString();

  const getSortIndicator = (key) => {
    if (sortConfig.key !== key) return ' ↕';
    return sortConfig.direction === 'asc' ? ' ↑' : ' ↓';
  };

  return (
    <div className="table-widget">
      <div className="table-container">
        <div className="table-header-row">
          {columns.map((col) => (
            <div key={col.key} className="table-header-cell">
              <span className="sort-trigger" onClick={() => handleSort(col.key)}>
                {col.label}
                <span className="sort-arrow">{getSortIndicator(col.key)}</span>
              </span>
            </div>
          ))}
        </div>
        <div className="table-body">
          {data.map((row) => (
            <div key={row.id} className="table-row">
              <div className="table-cell">{row.name}</div>
              <div className="table-cell">{row.department}</div>
              <div className="table-cell">
                <span className={`status-badge status-${row.status.toLowerCase().replace(' ', '-')}`}>
                  {row.status}
                </span>
              </div>
              <div className="table-cell">{formatSalary(row.salary)}</div>
              <div className="table-cell">{row.startDate}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
