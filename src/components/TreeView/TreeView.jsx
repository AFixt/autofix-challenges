import { useState } from 'react';
import './TreeView.css';

/**
 * Inaccessible Tree View
 *
 * Accessibility issues:
 * 1. Uses nested <div>s instead of <ul>/<li> elements
 * 2. No role="tree" on the container
 * 3. No role="treeitem" on individual nodes
 * 4. No role="group" on nested containers
 * 5. No aria-expanded on expandable nodes
 * 6. No aria-level, aria-setsize, aria-posinset
 * 7. No arrow key navigation (Up/Down/Left/Right)
 * 8. No Home/End key support
 * 9. No type-ahead character navigation
 * 10. Expand/collapse icons are decorative only, no text alternative
 * 11. No focus management or visible focus indicator on nodes
 * 12. Click target is only the text/icon, not the full row
 */

const treeData = [
  {
    id: 'src',
    label: 'src',
    icon: '📁',
    children: [
      {
        id: 'src-components',
        label: 'components',
        icon: '📁',
        children: [
          {
            id: 'src-components-header',
            label: 'Header',
            icon: '📁',
            children: [
              { id: 'header-index', label: 'index.jsx', icon: '⚛️' },
              { id: 'header-styles', label: 'styles.css', icon: '🎨' },
              { id: 'header-test', label: 'Header.test.js', icon: '🧪' },
            ],
          },
          {
            id: 'src-components-sidebar',
            label: 'Sidebar',
            icon: '📁',
            children: [
              { id: 'sidebar-index', label: 'index.jsx', icon: '⚛️' },
              { id: 'sidebar-styles', label: 'styles.css', icon: '🎨' },
            ],
          },
          {
            id: 'src-components-footer',
            label: 'Footer',
            icon: '📁',
            children: [
              { id: 'footer-index', label: 'index.jsx', icon: '⚛️' },
              { id: 'footer-styles', label: 'styles.css', icon: '🎨' },
            ],
          },
        ],
      },
      {
        id: 'src-utils',
        label: 'utils',
        icon: '📁',
        children: [
          { id: 'utils-api', label: 'api.js', icon: '📄' },
          { id: 'utils-helpers', label: 'helpers.js', icon: '📄' },
          { id: 'utils-constants', label: 'constants.js', icon: '📄' },
        ],
      },
      { id: 'src-app', label: 'App.jsx', icon: '⚛️' },
      { id: 'src-main', label: 'main.jsx', icon: '⚛️' },
      { id: 'src-index-css', label: 'index.css', icon: '🎨' },
    ],
  },
  {
    id: 'public',
    label: 'public',
    icon: '📁',
    children: [
      { id: 'public-index', label: 'index.html', icon: '🌐' },
      { id: 'public-favicon', label: 'favicon.ico', icon: '🖼️' },
      { id: 'public-robots', label: 'robots.txt', icon: '📄' },
    ],
  },
  { id: 'package-json', label: 'package.json', icon: '📦' },
  { id: 'readme', label: 'README.md', icon: '📄' },
  { id: 'gitignore', label: '.gitignore', icon: '📄' },
];

function TreeNode({ node, depth = 0 }) {
  const [expanded, setExpanded] = useState(false);
  const hasChildren = node.children && node.children.length > 0;

  return (
    <div className="tree-node">
      <div
        className="tree-node-content"
        style={{ paddingLeft: `${depth * 20 + 8}px` }}
        onClick={() => hasChildren && setExpanded(!expanded)}
      >
        {hasChildren && (
          <span className={`tree-chevron ${expanded ? 'expanded' : ''}`}>▶</span>
        )}
        {!hasChildren && <span className="tree-chevron-spacer"></span>}
        <span className="tree-icon">{node.icon}</span>
        <span className="tree-label">{node.label}</span>
      </div>
      {hasChildren && expanded && (
        <div className="tree-children">
          {node.children.map((child) => (
            <TreeNode key={child.id} node={child} depth={depth + 1} />
          ))}
        </div>
      )}
    </div>
  );
}

export default function TreeView() {
  return (
    <div className="tree-widget">
      <div className="tree-title">Project Files</div>
      <div className="tree-container">
        {treeData.map((node) => (
          <TreeNode key={node.id} node={node} />
        ))}
      </div>
    </div>
  );
}
