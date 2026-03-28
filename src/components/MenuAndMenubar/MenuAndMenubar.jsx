import { useState } from 'react';
import './MenuAndMenubar.css';

/**
 * Inaccessible Menu and Menubar
 *
 * Accessibility issues:
 * 1. No role="menubar" on container
 * 2. No role="menuitem" on items
 * 3. No role="menu" on dropdown panels
 * 4. No aria-haspopup on items with submenus
 * 5. No aria-expanded on parent items
 * 6. No Left/Right arrow keys for menubar navigation
 * 7. No Up/Down arrow keys for menu navigation
 * 8. No Escape to close menus
 * 9. No Enter/Space to activate items
 * 10. Submenus are divs, no semantic structure
 * 11. Separators are visual-only, no role="separator"
 * 12. No roving tabindex
 */

const menuData = [
  { label: 'File', items: [
    { label: 'New File' }, { label: 'Open...' }, { label: 'Save' },
    { type: 'separator' },
    { label: 'Export', submenu: [{ label: 'PDF' }, { label: 'PNG' }, { label: 'SVG' }] },
    { type: 'separator' },
    { label: 'Close' },
  ]},
  { label: 'Edit', items: [
    { label: 'Undo' }, { label: 'Redo' },
    { type: 'separator' },
    { label: 'Cut' }, { label: 'Copy' }, { label: 'Paste' },
    { type: 'separator' },
    { label: 'Find & Replace' },
  ]},
  { label: 'View', items: [
    { label: 'Zoom In' }, { label: 'Zoom Out' }, { label: 'Reset Zoom' },
    { type: 'separator' },
    { label: 'Full Screen' }, { label: 'Toggle Sidebar' },
  ]},
  { label: 'Help', items: [
    { label: 'Documentation' }, { label: 'Keyboard Shortcuts' },
    { type: 'separator' },
    { label: 'About' },
  ]},
];

export default function MenuAndMenubar() {
  const [openMenu, setOpenMenu] = useState(null);
  const [openSubmenu, setOpenSubmenu] = useState(null);

  return (
    <div className="menubar-widget">
      <div className="menubar">
        {menuData.map((menu, mi) => (
          <div key={mi} className="menubar-item-wrapper">
            <div
              className={`menubar-item ${openMenu === mi ? 'open' : ''}`}
              onClick={() => setOpenMenu(openMenu === mi ? null : mi)}
            >
              {menu.label}
            </div>
            {openMenu === mi && (
              <div className="menu-dropdown">
                {menu.items.map((item, ii) =>
                  item.type === 'separator' ? (
                    <div key={ii} className="menu-separator" />
                  ) : (
                    <div key={ii} className="menu-item-wrapper">
                      <div
                        className="menu-item"
                        onClick={() => { if (!item.submenu) { setOpenMenu(null); } }}
                        onMouseEnter={() => item.submenu && setOpenSubmenu(ii)}
                        onMouseLeave={() => item.submenu && setOpenSubmenu(null)}
                      >
                        {item.label}
                        {item.submenu && <span className="submenu-arrow">›</span>}
                      </div>
                      {item.submenu && openSubmenu === ii && (
                        <div
                          className="submenu-dropdown"
                          onMouseEnter={() => setOpenSubmenu(ii)}
                          onMouseLeave={() => setOpenSubmenu(null)}
                        >
                          {item.submenu.map((sub, si) => (
                            <div key={si} className="menu-item" onClick={() => setOpenMenu(null)}>
                              {sub.label}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )
                )}
              </div>
            )}
          </div>
        ))}
      </div>
      <div className="menubar-content">
        <p>Click on the menu items above to see dropdowns. This menubar has no keyboard support, no ARIA roles, and no semantic structure.</p>
      </div>
    </div>
  );
}
