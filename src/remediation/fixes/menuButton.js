/**
 * Post-render remediation for the Menu Button component.
 *
 * Fixes attempted:
 * - Add role="button" (or verify native button) to .menubutton-trigger and .icon-trigger
 * - Add aria-haspopup="menu" to the trigger
 * - Add aria-expanded to the trigger reflecting open/closed state
 * - Add aria-controls linking the trigger to .menubutton-menu
 * - Add role="menu" to .menubutton-menu
 * - Add role="menuitem" to each .menubutton-item
 * - Add role="separator" to .menubutton-sep elements
 * - Add Down arrow key to open menu and move focus to first item
 * - Add Up/Down arrow navigation within the menu with wrap
 * - Add Escape to close the menu and return focus to the trigger
 * - Add Home/End for first/last item in the menu
 * - Add tabindex management so only the trigger is in the tab sequence
 *
 * Limitations discovered:
 * - React owns the open/close toggle; keyboard open/close calls .click() on
 *   the trigger and relies on the component's state handler responding
 * - Focus management after Escape relies on trigger being in the DOM and
 *   focusable; if the trigger is conditionally rendered this will fail silently
 * - Icon triggers (.icon-trigger) may have no visible label; aria-label is
 *   read from title, data-label, or a generic fallback
 */

import { setRole, setAria, setTabIndex, ensureId, controls } from '../lib/aria.js';
import { makeClickable, onKeyDown } from '../lib/keyboard.js';
import { saveFocus } from '../lib/focus.js';
import { queryAll } from '../lib/dom.js';
import { observeChanges, onElementAdded } from '../lib/observer.js';

function isMenuOpen(menu) {
  if (!menu) return false;
  return !menu.hidden && window.getComputedStyle(menu).display !== 'none';
}

function remediateMenuButton(widget) {
  const triggers = queryAll('.menubutton-trigger, .icon-trigger', widget);

  triggers.forEach((trigger, ti) => {
    const menu = trigger.nextElementSibling?.classList.contains('menubutton-menu')
      ? trigger.nextElementSibling
      : widget.querySelector('.menubutton-menu');

    const tag = trigger.tagName.toLowerCase();
    if (tag !== 'button') {
      setRole(trigger, 'button');
      setTabIndex(trigger, 0);
      makeClickable(trigger, `menubutton-trigger-${ti}`);
    }

    setAria(trigger, 'haspopup', 'menu');
    setAria(trigger, 'expanded', String(isMenuOpen(menu)));

    if (!trigger.getAttribute('aria-label') && trigger.classList.contains('icon-trigger')) {
      const label =
        trigger.getAttribute('title') ||
        trigger.dataset.label ||
        trigger.textContent.trim() ||
        'Menu';
      setAria(trigger, 'label', label);
    }

    if (menu) {
      controls(trigger, menu);
    }

    onKeyDown(trigger, `menubutton-open-${ti}`, (e) => {
      if (e.key === 'ArrowDown' || e.key === 'Enter' || e.key === ' ') {
        if (!isMenuOpen(menu)) {
          e.preventDefault();
          trigger.click();
          setTimeout(() => {
            const firstItem = menu?.querySelector('.menubutton-item');
            if (firstItem) firstItem.focus();
          }, 50);
        }
      } else if (e.key === 'ArrowUp') {
        if (!isMenuOpen(menu)) {
          e.preventDefault();
          trigger.click();
          setTimeout(() => {
            const items = queryAll('.menubutton-item', menu);
            if (items.length > 0) items[items.length - 1].focus();
          }, 50);
        }
      }
    });
  });

  const menus = queryAll('.menubutton-menu', widget);
  menus.forEach((menu, mi) => {
    setRole(menu, 'menu');
    ensureId(menu, `menubutton-menu-${mi}`);

    const items = queryAll('.menubutton-item', menu);
    items.forEach((item, ii) => {
      setRole(item, 'menuitem');
      setTabIndex(item, -1);
    });

    const seps = queryAll('.menubutton-sep', menu);
    seps.forEach((sep) => {
      setRole(sep, 'separator');
    });

    onKeyDown(menu, `menubutton-nav-${mi}`, (e) => {
      const menuItems = queryAll('.menubutton-item', menu);
      if (menuItems.length === 0) return;

      const current = document.activeElement;
      const idx = menuItems.indexOf(current);

      if (e.key === 'ArrowDown') {
        e.preventDefault();
        const next = idx === -1 ? 0 : (idx + 1) % menuItems.length;
        menuItems[next].focus();
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        const prev = idx <= 0 ? menuItems.length - 1 : idx - 1;
        menuItems[prev].focus();
      } else if (e.key === 'Home') {
        e.preventDefault();
        menuItems[0].focus();
      } else if (e.key === 'End') {
        e.preventDefault();
        menuItems[menuItems.length - 1].focus();
      } else if (e.key === 'Escape' || e.key === 'Tab') {
        e.preventDefault();
        // Find corresponding trigger
        const trigger = widget.querySelector('.menubutton-trigger, .icon-trigger');
        if (trigger) {
          trigger.click();
          trigger.focus();
        }
      } else if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        if (current && menuItems.includes(current)) {
          current.click();
        }
        const trigger = widget.querySelector('.menubutton-trigger, .icon-trigger');
        if (trigger) trigger.focus();
      }
    });
  });
}

export function apply() {
  const cleanups = [];

  const setup = (widget) => {
    remediateMenuButton(widget);

    const stop = observeChanges(widget, () => {
      remediateMenuButton(widget);
    });
    cleanups.push(stop);
  };

  const stopWatching = onElementAdded('.menubutton-widget', setup);
  cleanups.push(stopWatching);

  return () => cleanups.forEach((fn) => fn());
}
