/**
 * Post-render remediation for the Tab Panel component.
 *
 * Fixes attempted:
 * - Add role="tablist" to tab container
 * - Add role="tab" to each tab
 * - Add role="tabpanel" to content area
 * - Add aria-selected to tabs
 * - Add aria-controls / aria-labelledby relationships
 * - Implement roving tabindex
 * - Add Left/Right arrow key navigation
 * - Add Home/End key support
 *
 * Limitations discovered:
 * - Clicking a tab triggers React state change which re-renders both
 *   the tab list and panel content, stripping all applied ARIA attributes.
 *   The MutationObserver must re-apply on every state change.
 * - Cannot programmatically activate a tab via arrow keys without
 *   simulating a click on the div, since React owns the state.
 * - The active tab detection relies on the CSS class "active" which
 *   is an implementation detail that could change.
 */

import { setRole, setAria, ensureId, controls, labelledBy } from '../lib/aria.js';
import { arrowNavigation, makeClickable } from '../lib/keyboard.js';
import { rovingTabIndex } from '../lib/focus.js';
import { queryAll } from '../lib/dom.js';
import { createFix } from '../lib/fixFactory.js';

function remediateTabs(widget) {
  const tabList = widget.querySelector('.tab-list');
  const tabs = queryAll('.tab-item', widget);
  const panel = widget.querySelector('.tab-content');

  if (!tabList || tabs.length === 0 || !panel) return;

  // Roles
  setRole(tabList, 'tablist');
  setRole(panel, 'tabpanel');

  ensureId(panel, 'tabpanel');

  let activeIndex = 0;

  tabs.forEach((tab, i) => {
    setRole(tab, 'tab');
    ensureId(tab, 'tab');

    const isActive = tab.classList.contains('active');
    setAria(tab, 'selected', isActive);

    if (isActive) {
      activeIndex = i;
      controls(tab, panel);
      labelledBy(panel, tab);
    }

    // Make tabs focusable
    makeClickable(tab, `tab-${i}`);
  });

  // Roving tabindex — only the active tab is in the tab order
  rovingTabIndex(tabs, activeIndex);

  // Arrow key navigation with activation on focus
  arrowNavigation(tabList, '.tab-item', {
    direction: 'horizontal',
    wrap: true,
    homeEnd: true,
    name: 'tabArrowNav',
    onFocus: (focusedTab) => {
      // Activate the tab by clicking it (triggers React state update)
      focusedTab.click();
    },
  });
}

export const apply = createFix('.tabs-widget', remediateTabs);
