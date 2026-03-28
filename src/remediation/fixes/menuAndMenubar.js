/**
 * Post-render remediation for the Menu and Menubar component.
 *
 * Fixes attempted:
 * - Add role="menubar" to .menubar
 * - Add role="menuitem" (or menuitem with aria-haspopup) to .menubar-item elements
 * - Add aria-haspopup="menu" and aria-expanded to menubar items that have dropdowns
 * - Add role="menu" to .menu-dropdown and .submenu-dropdown
 * - Add role="menuitem" to .menu-item elements
 * - Add role="separator" to .menu-separator elements
 * - Add Left/Right arrow keys for menubar horizontal navigation (roving tabindex)
 * - Add Up/Down arrow keys for dropdown vertical navigation
 * - Add Escape to close dropdown and return focus to parent menubar item
 * - Add Enter/Space to open dropdown or activate menu item
 * - Add Home/End within dropdown menus
 *
 * Limitations discovered:
 * - React controls open/close state via class toggling; keydown events attempt
 *   to call .click() which relies on the component's own handler
 * - Submenus (nested .submenu-dropdown) require recursive handling; only one
 *   level of nesting is fully supported by this fix
 * - Tab key should close the menu entirely and move to next page element;
 *   this requires knowing all open menus, which is managed per-widget only
 */

import { setRole, setAria, setTabIndex, ensureId } from '../lib/aria.js';
import { onKeyDown } from '../lib/keyboard.js';
import { rovingTabIndex } from '../lib/focus.js';
import { queryAll } from '../lib/dom.js';
import { observeChanges, onElementAdded } from '../lib/observer.js';

function isExpanded(el) {
  return el?.getAttribute('aria-expanded') === 'true' ||
    el?.classList.contains('open');
}

function remediateMenubar(widget) {
  const menubar = widget.querySelector('.menubar');
  if (!menubar) return;

  setRole(menubar, 'menubar');
  setAria(menubar, 'label', 'Site menu');

  const menubarItems = queryAll('.menubar-item', menubar);
  menubarItems.forEach((item, i) => {
    setRole(item, 'menuitem');
    const dropdown = item.querySelector('.menu-dropdown');

    if (dropdown) {
      setAria(item, 'haspopup', 'menu');
      setAria(item, 'expanded', String(isExpanded(item)));
      ensureId(dropdown, `menu-dropdown-${i}`);
      setAria(item, 'controls', dropdown.id);
    }

    // Only the first item starts with tabindex=0 (roving tabindex)
    setTabIndex(item, i === 0 ? 0 : -1);
  });

  // Roving tabindex for menubar
  rovingTabIndex(menubarItems, 0);

  // Horizontal arrow key nav in menubar
  onKeyDown(menubar, 'menubarHorizNav', (e) => {
    const items = queryAll('.menubar-item', menubar);
    const current = document.activeElement;
    const idx = items.indexOf(current);
    if (idx === -1) return;

    if (e.key === 'ArrowRight') {
      e.preventDefault();
      const next = (idx + 1) % items.length;
      rovingTabIndex(items, next);
      items[next].focus();
    } else if (e.key === 'ArrowLeft') {
      e.preventDefault();
      const prev = (idx - 1 + items.length) % items.length;
      rovingTabIndex(items, prev);
      items[prev].focus();
    } else if (e.key === 'ArrowDown' || e.key === 'Enter' || e.key === ' ') {
      const item = items[idx];
      const dropdown = item?.querySelector('.menu-dropdown');
      if (dropdown) {
        e.preventDefault();
        item.click();
        setTimeout(() => {
          const firstItem = dropdown.querySelector('.menu-item');
          if (firstItem) firstItem.focus();
        }, 50);
      }
    }
  });

  // Each dropdown menu
  const dropdowns = queryAll('.menu-dropdown', widget);
  dropdowns.forEach((dropdown, di) => {
    setRole(dropdown, 'menu');
    ensureId(dropdown, `menu-dropdown-${di}`);

    const items = queryAll('.menu-item', dropdown);
    items.forEach((item, ii) => {
      setRole(item, 'menuitem');
      setTabIndex(item, ii === 0 ? 0 : -1);

      const submenu = item.querySelector('.submenu-dropdown');
      if (submenu) {
        setAria(item, 'haspopup', 'menu');
        setAria(item, 'expanded', String(item.classList.contains('open')));
        setRole(submenu, 'menu');
        ensureId(submenu, `submenu-${di}-${ii}`);
      }
    });

    const separators = queryAll('.menu-separator', dropdown);
    separators.forEach((sep) => {
      setRole(sep, 'separator');
    });

    onKeyDown(dropdown, `menu-dropdown-nav-${di}`, (e) => {
      const menuItems = queryAll('.menu-item', dropdown);
      const current = document.activeElement;
      const idx = menuItems.indexOf(current);

      if (e.key === 'ArrowDown') {
        e.preventDefault();
        const next = (idx + 1) % menuItems.length;
        menuItems[next].focus();
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        const prev = (idx - 1 + menuItems.length) % menuItems.length;
        menuItems[prev].focus();
      } else if (e.key === 'Home') {
        e.preventDefault();
        menuItems[0]?.focus();
      } else if (e.key === 'End') {
        e.preventDefault();
        menuItems[menuItems.length - 1]?.focus();
      } else if (e.key === 'Escape') {
        e.preventDefault();
        // Find the parent menubar item and refocus it
        const parentItem = menubarItems.find((mi) => mi.contains(dropdown));
        if (parentItem) {
          parentItem.click();
          parentItem.focus();
        }
      }
    });
  });
}

export function apply() {
  const cleanups = [];

  const setup = (widget) => {
    remediateMenubar(widget);

    const stop = observeChanges(widget, () => {
      remediateMenubar(widget);
    });
    cleanups.push(stop);
  };

  const stopWatching = onElementAdded('.menubar-widget', setup);
  cleanups.push(stopWatching);

  return () => cleanups.forEach((fn) => fn());
}
