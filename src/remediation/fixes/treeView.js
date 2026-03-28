/**
 * Post-render remediation for the Tree View component.
 *
 * Fixes attempted:
 * - Add role="tree" to root container
 * - Add role="treeitem" to each node
 * - Add role="group" to child containers
 * - Add aria-expanded on expandable nodes
 * - Add aria-level, aria-setsize, aria-posinset
 * - Make nodes focusable
 * - Add Up/Down arrow keys for linear navigation
 * - Add Left arrow to collapse or move to parent
 * - Add Right arrow to expand or move to first child
 * - Add Home/End keys
 * - Add Enter/Space to toggle expand/collapse
 *
 * Limitations discovered:
 * - Tree keyboard navigation is the most complex ARIA pattern. External
 *   remediation must re-derive the tree structure from the DOM on every
 *   mutation, since React re-renders on expand/collapse.
 * - aria-level must be calculated from DOM nesting depth, which is fragile
 *   if the component's markup structure changes.
 * - Left/Right arrow expand/collapse requires simulating click on the
 *   chevron element, coupling the fix to the component's internal structure.
 * - Type-ahead (character) navigation is extremely difficult to add externally
 *   because it requires indexing all visible node labels and maintaining
 *   search state across keystrokes — omitted from this fix.
 * - The component uses inline paddingLeft for visual nesting, which the
 *   remediation ignores in favor of aria-level, but this creates a disconnect
 *   between visual and semantic nesting if the styles ever change.
 */

import { setRole, setAria, ensureId } from '../lib/aria.js';
import { onKeyDown, makeClickable } from '../lib/keyboard.js';
import { queryAll } from '../lib/dom.js';
import { observeChanges, onElementAdded } from '../lib/observer.js';

/**
 * Calculate tree metadata for a node based on its DOM position.
 */
function getNodeDepth(nodeContent) {
  let depth = 1;
  let el = nodeContent.closest('.tree-node');
  while (el) {
    const parentChildren = el.parentElement;
    if (parentChildren && parentChildren.classList.contains('tree-children')) {
      depth++;
      el = parentChildren.closest('.tree-node');
    } else {
      break;
    }
  }
  return depth;
}

function getSiblingsInfo(nodeEl) {
  const parent = nodeEl.parentElement;
  if (!parent) return { setSize: 1, posInSet: 1 };
  const siblings = Array.from(parent.children).filter(
    (child) => child.classList.contains('tree-node')
  );
  return {
    setSize: siblings.length,
    posInSet: siblings.indexOf(nodeEl) + 1,
  };
}

function getAllVisibleNodeContents(container) {
  return queryAll('.tree-node-content', container);
}

function remediateTree(widget) {
  const container = widget.querySelector('.tree-container');
  if (!container) return;

  setRole(container, 'tree');
  setAria(container, 'label', 'Project Files');

  const allNodes = queryAll('.tree-node', container);
  allNodes.forEach((nodeEl) => {
    const content = nodeEl.querySelector(':scope > .tree-node-content');
    if (!content) return;

    setRole(content, 'treeitem');
    content.tabIndex = -1;

    const depth = getNodeDepth(content);
    setAria(content, 'level', depth);

    const { setSize, posInSet } = getSiblingsInfo(nodeEl);
    setAria(content, 'setsize', setSize);
    setAria(content, 'posinset', posInSet);

    const chevron = content.querySelector('.tree-chevron');
    const childContainer = nodeEl.querySelector(':scope > .tree-children');
    const hasChildren = !!chevron;

    if (hasChildren) {
      const isExpanded = chevron.classList.contains('expanded');
      setAria(content, 'expanded', isExpanded);

      if (childContainer) {
        setRole(childContainer, 'group');
      }
    }

    // Make node clickable via keyboard
    makeClickable(content, `treenode-${ensureId(content, 'treenode')}`);
  });

  // Set the first node as the active tab stop
  const firstContent = container.querySelector('.tree-node-content');
  if (firstContent) {
    firstContent.tabIndex = 0;
  }

  // Keyboard navigation for the tree
  onKeyDown(container, 'treeNav', (e) => {
    const visibleNodes = getAllVisibleNodeContents(container);
    const current = document.activeElement;
    const index = visibleNodes.indexOf(current);
    if (index === -1) return;

    const currentNodeEl = current.closest('.tree-node');
    const chevron = current.querySelector('.tree-chevron');
    const isExpandable = !!chevron;
    const isExpanded = chevron && chevron.classList.contains('expanded');

    switch (e.key) {
      case 'ArrowDown': {
        e.preventDefault();
        const next = visibleNodes[index + 1];
        if (next) {
          current.tabIndex = -1;
          next.tabIndex = 0;
          next.focus();
        }
        break;
      }

      case 'ArrowUp': {
        e.preventDefault();
        const prev = visibleNodes[index - 1];
        if (prev) {
          current.tabIndex = -1;
          prev.tabIndex = 0;
          prev.focus();
        }
        break;
      }

      case 'ArrowRight': {
        e.preventDefault();
        if (isExpandable && !isExpanded) {
          // Expand the node
          current.click();
        } else if (isExpanded) {
          // Move to first child
          requestAnimationFrame(() => {
            const updatedVisible = getAllVisibleNodeContents(container);
            const updatedIndex = updatedVisible.indexOf(current);
            const child = updatedVisible[updatedIndex + 1];
            if (child) {
              current.tabIndex = -1;
              child.tabIndex = 0;
              child.focus();
            }
          });
        }
        break;
      }

      case 'ArrowLeft': {
        e.preventDefault();
        if (isExpandable && isExpanded) {
          // Collapse the node
          current.click();
        } else {
          // Move to parent node
          const parentChildren = currentNodeEl.parentElement;
          if (parentChildren && parentChildren.classList.contains('tree-children')) {
            const parentNode = parentChildren.closest('.tree-node');
            if (parentNode) {
              const parentContent = parentNode.querySelector(':scope > .tree-node-content');
              if (parentContent) {
                current.tabIndex = -1;
                parentContent.tabIndex = 0;
                parentContent.focus();
              }
            }
          }
        }
        break;
      }

      case 'Home': {
        e.preventDefault();
        const first = visibleNodes[0];
        if (first) {
          current.tabIndex = -1;
          first.tabIndex = 0;
          first.focus();
        }
        break;
      }

      case 'End': {
        e.preventDefault();
        const last = visibleNodes[visibleNodes.length - 1];
        if (last) {
          current.tabIndex = -1;
          last.tabIndex = 0;
          last.focus();
        }
        break;
      }

      case 'Enter':
      case ' ': {
        e.preventDefault();
        current.click();
        break;
      }

      default:
        return;
    }
  });
}

export function apply() {
  const cleanups = [];

  const setup = (widget) => {
    remediateTree(widget);

    const stop = observeChanges(widget, () => {
      remediateTree(widget);
    });
    cleanups.push(stop);
  };

  const stopWatching = onElementAdded('.tree-widget', setup);
  cleanups.push(stopWatching);

  return () => cleanups.forEach((fn) => fn());
}
