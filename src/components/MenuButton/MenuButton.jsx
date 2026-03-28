import { useState } from 'react';
import './MenuButton.css';

/**
 * Inaccessible Menu Button
 *
 * Accessibility issues:
 * 1. Button trigger is a div, not a button
 * 2. No aria-haspopup="menu"
 * 3. No aria-expanded on trigger
 * 4. Dropdown has no role="menu"
 * 5. Menu items have no role="menuitem"
 * 6. No arrow key navigation in menu
 * 7. No Escape to close menu
 * 8. No Enter/Space to activate items
 * 9. No focus management on open/close
 * 10. No focus return to trigger on close
 * 11. Icon-only trigger has no accessible label
 */

export default function MenuButton() {
  const [actionsOpen, setActionsOpen] = useState(false);
  const [sortOpen, setSortOpen] = useState(false);

  return (
    <div className="menubutton-widget">
      <div className="menubutton-demo">
        <div className="menubutton-demo-title">Text Menu Button</div>
        <div className="menubutton-wrapper">
          <div className="menubutton-trigger" onClick={() => setActionsOpen(!actionsOpen)}>
            More Actions ▾
          </div>
          {actionsOpen && (
            <div className="menubutton-menu">
              <div className="menubutton-item" onClick={() => setActionsOpen(false)}>✏️ Edit</div>
              <div className="menubutton-item" onClick={() => setActionsOpen(false)}>📋 Duplicate</div>
              <div className="menubutton-item" onClick={() => setActionsOpen(false)}>📦 Archive</div>
              <div className="menubutton-sep" />
              <div className="menubutton-item danger" onClick={() => setActionsOpen(false)}>🗑️ Delete</div>
            </div>
          )}
        </div>
      </div>

      <div className="menubutton-demo">
        <div className="menubutton-demo-title">Icon Menu Button</div>
        <div className="menubutton-wrapper">
          <div className="menubutton-trigger icon-trigger" onClick={() => setSortOpen(!sortOpen)}>
            ⋮
          </div>
          {sortOpen && (
            <div className="menubutton-menu">
              <div className="menubutton-item" onClick={() => setSortOpen(false)}>Sort by Name</div>
              <div className="menubutton-item" onClick={() => setSortOpen(false)}>Sort by Date</div>
              <div className="menubutton-item" onClick={() => setSortOpen(false)}>Sort by Size</div>
              <div className="menubutton-item" onClick={() => setSortOpen(false)}>Sort by Type</div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
