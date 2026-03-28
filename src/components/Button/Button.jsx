import { useState } from 'react';
import './Button.css';

/**
 * Inaccessible Button
 *
 * Accessibility issues:
 * 1. All buttons are divs or spans, not button elements
 * 2. No role="button"
 * 3. Not keyboard focusable (no tabindex)
 * 4. No Enter/Space key activation
 * 5. Icon-only buttons have no accessible label
 * 6. Disabled state conveyed only by CSS opacity (no aria-disabled)
 * 7. Toggle buttons have no aria-pressed state
 * 8. No focus indicator styles
 */

export default function Button() {
  const [boldActive, setBoldActive] = useState(false);
  const [italicActive, setItalicActive] = useState(true);

  return (
    <div className="button-widget">
      <div className="button-section">
        <div className="button-section-title">Standard Buttons</div>
        <div className="button-row">
          <span className="btn-demo primary" onClick={() => {}}>Save Changes</span>
          <span className="btn-demo secondary" onClick={() => {}}>Cancel</span>
          <span className="btn-demo outline" onClick={() => {}}>Preview</span>
          <span className="btn-demo danger" onClick={() => {}}>Delete</span>
        </div>
      </div>

      <div className="button-section">
        <div className="button-section-title">Icon Buttons</div>
        <div className="button-row">
          <div className="btn-demo icon-btn" onClick={() => {}}>✏️</div>
          <div className="btn-demo icon-btn" onClick={() => {}}>🗑️</div>
          <div className="btn-demo icon-btn" onClick={() => {}}>⬇️</div>
          <div className="btn-demo icon-btn" onClick={() => {}}>🔗</div>
        </div>
      </div>

      <div className="button-section">
        <div className="button-section-title">Toggle Buttons</div>
        <div className="button-row">
          <span
            className={`btn-demo toggle ${boldActive ? 'pressed' : ''}`}
            onClick={() => setBoldActive(!boldActive)}
          >
            <strong>B</strong>
          </span>
          <span
            className={`btn-demo toggle ${italicActive ? 'pressed' : ''}`}
            onClick={() => setItalicActive(!italicActive)}
          >
            <em>I</em>
          </span>
        </div>
      </div>

      <div className="button-section">
        <div className="button-section-title">Disabled Buttons</div>
        <div className="button-row">
          <span className="btn-demo primary disabled">Submit</span>
          <span className="btn-demo secondary disabled">Export</span>
        </div>
      </div>
    </div>
  );
}
