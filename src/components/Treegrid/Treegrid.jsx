import { useState } from 'react';
import './Treegrid.css';

/**
 * Inaccessible Treegrid
 *
 * Accessibility issues:
 * 1. No role="treegrid" on container
 * 2. No role="row" on rows
 * 3. No role="gridcell" on cells
 * 4. No role="rowheader" on the name column
 * 5. No aria-expanded on expandable rows
 * 6. No aria-level, aria-setsize, aria-posinset
 * 7. No arrow key navigation
 * 8. No Enter/Space to expand/collapse
 * 9. No Home/End, Ctrl+Home/Ctrl+End
 * 10. No column headers with proper roles
 * 11. No aria-colindex on cells
 * 12. Expand/collapse icon purely visual
 */

const fileData = [
  { id: 'src', name: 'src', size: '—', type: 'Folder', modified: '2024-03-10', children: [
    { id: 'src-app', name: 'App.jsx', size: '4.2 KB', type: 'JSX', modified: '2024-03-10' },
    { id: 'src-main', name: 'main.jsx', size: '0.8 KB', type: 'JSX', modified: '2024-03-08' },
    { id: 'src-css', name: 'index.css', size: '2.1 KB', type: 'CSS', modified: '2024-03-09' },
  ]},
  { id: 'public', name: 'public', size: '—', type: 'Folder', modified: '2024-03-05', children: [
    { id: 'pub-idx', name: 'index.html', size: '1.2 KB', type: 'HTML', modified: '2024-03-05' },
    { id: 'pub-fav', name: 'favicon.ico', size: '4.0 KB', type: 'ICO', modified: '2024-02-20' },
  ]},
  { id: 'pkg', name: 'package.json', size: '1.5 KB', type: 'JSON', modified: '2024-03-10' },
  { id: 'readme', name: 'README.md', size: '3.2 KB', type: 'Markdown', modified: '2024-03-01' },
];

function TreegridRow({ item, depth = 0, expanded, onToggle }) {
  const hasKids = item.children && item.children.length > 0;
  const isOpen = expanded[item.id];

  return (
    <>
      <div className="tg-row">
        <div className="tg-cell tg-name" style={{ paddingLeft: `${depth * 24 + 12}px` }}>
          {hasKids && (
            <span className={`tg-chevron ${isOpen ? 'open' : ''}`} onClick={() => onToggle(item.id)}>▶</span>
          )}
          {!hasKids && <span className="tg-chevron-spacer" />}
          <span className="tg-file-icon">{hasKids ? '📁' : '📄'}</span>
          {item.name}
        </div>
        <div className="tg-cell">{item.size}</div>
        <div className="tg-cell">{item.type}</div>
        <div className="tg-cell">{item.modified}</div>
      </div>
      {hasKids && isOpen && item.children.map((child) => (
        <TreegridRow key={child.id} item={child} depth={depth + 1} expanded={expanded} onToggle={onToggle} />
      ))}
    </>
  );
}

export default function Treegrid() {
  const [expanded, setExpanded] = useState({ src: true });

  const toggle = (id) => {
    setExpanded({ ...expanded, [id]: !expanded[id] });
  };

  return (
    <div className="treegrid-widget">
      <div className="tg-container">
        <div className="tg-header">
          <div className="tg-hcell tg-name-h">Name</div>
          <div className="tg-hcell">Size</div>
          <div className="tg-hcell">Type</div>
          <div className="tg-hcell">Modified</div>
        </div>
        <div className="tg-body">
          {fileData.map((item) => (
            <TreegridRow key={item.id} item={item} expanded={expanded} onToggle={toggle} />
          ))}
        </div>
      </div>
    </div>
  );
}
