import { useState } from 'react';
import './Tooltip.css';

/**
 * Inaccessible Tooltip
 *
 * Accessibility issues:
 * 1. Tooltips have no role="tooltip"
 * 2. No aria-describedby linking trigger to tooltip
 * 3. Tooltips only appear on hover, not on focus
 * 4. No Escape key to dismiss tooltip
 * 5. Tooltip content not available to screen readers
 * 6. Tooltip disappears when mouse moves to it
 * 7. No delay before showing
 * 8. Trigger elements have no indication that a tooltip exists
 * 9. Tooltips can overflow viewport
 * 10. No id association between triggers and tooltips
 */

function TipWrap({ tip, children }) {
  const [show, setShow] = useState(false);
  return (
    <span
      className="tip-trigger"
      onMouseEnter={() => setShow(true)}
      onMouseLeave={() => setShow(false)}
    >
      {children}
      {show && <span className="tip-popup">{tip}</span>}
    </span>
  );
}

export default function Tooltip() {
  return (
    <div className="tooltip-widget">
      <div className="tip-section">
        <div className="tip-section-title">Icon Buttons with Tooltips</div>
        <div className="tip-row">
          <TipWrap tip="Edit document"><span className="tip-icon-btn">✏️</span></TipWrap>
          <TipWrap tip="Delete item"><span className="tip-icon-btn">🗑️</span></TipWrap>
          <TipWrap tip="Download file"><span className="tip-icon-btn">⬇️</span></TipWrap>
          <TipWrap tip="Share link"><span className="tip-icon-btn">🔗</span></TipWrap>
        </div>
      </div>

      <div className="tip-section">
        <div className="tip-section-title">Text with Tooltips</div>
        <p className="tip-paragraph">
          Hover over the <TipWrap tip="Cascading Style Sheets — used for styling web pages"><span className="tip-term">CSS</span></TipWrap> and{' '}
          <TipWrap tip="Application Programming Interface — allows programs to communicate"><span className="tip-term">API</span></TipWrap> abbreviations
          to see their definitions.
        </p>
      </div>

      <div className="tip-section">
        <div className="tip-section-title">Form Fields with Help Tooltips</div>
        <div className="tip-form-field">
          <div className="tip-form-label">
            Password
            <TipWrap tip="Must be at least 8 characters with one uppercase, one number, and one symbol">
              <span className="tip-help-icon">ⓘ</span>
            </TipWrap>
          </div>
          <input type="password" className="tip-form-input" placeholder="Enter password" />
        </div>
      </div>
    </div>
  );
}
