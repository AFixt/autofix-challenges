import { useState } from 'react';
import './Toolbar.css';

/**
 * Inaccessible Toolbar
 *
 * Accessibility issues:
 * 1. No role="toolbar" on container
 * 2. Buttons are divs/spans, not button elements
 * 3. No role="button" on items
 * 4. No keyboard navigation (Left/Right arrow keys)
 * 5. No Home/End key support
 * 6. No roving tabindex
 * 7. No aria-label on toolbar
 * 8. No aria-pressed on toggle buttons
 * 9. Icon-only buttons have no accessible labels
 * 10. Button groups have no semantic separation
 * 11. No aria-disabled on disabled buttons
 */

export default function Toolbar() {
  const [bold, setBold] = useState(false);
  const [italic, setItalic] = useState(false);
  const [underline, setUnderline] = useState(false);
  const [align, setAlign] = useState('left');

  return (
    <div className="toolbar-widget">
      <div className="toolbar">
        <div className="toolbar-group">
          <span className={`toolbar-btn ${bold ? 'active' : ''}`} onClick={() => setBold(!bold)}><strong>B</strong></span>
          <span className={`toolbar-btn ${italic ? 'active' : ''}`} onClick={() => setItalic(!italic)}><em>I</em></span>
          <span className={`toolbar-btn ${underline ? 'active' : ''}`} onClick={() => setUnderline(!underline)}><u>U</u></span>
          <span className="toolbar-btn" onClick={() => {}}>S̶</span>
        </div>
        <div className="toolbar-sep" />
        <div className="toolbar-group">
          <span className={`toolbar-btn ${align === 'left' ? 'active' : ''}`} onClick={() => setAlign('left')}>☰</span>
          <span className={`toolbar-btn ${align === 'center' ? 'active' : ''}`} onClick={() => setAlign('center')}>☰</span>
          <span className={`toolbar-btn ${align === 'right' ? 'active' : ''}`} onClick={() => setAlign('right')}>☰</span>
          <span className={`toolbar-btn ${align === 'justify' ? 'active' : ''}`} onClick={() => setAlign('justify')}>☰</span>
        </div>
        <div className="toolbar-sep" />
        <div className="toolbar-group">
          <span className="toolbar-btn" onClick={() => {}}>🔗</span>
          <span className="toolbar-btn" onClick={() => {}}>🖼️</span>
          <span className="toolbar-btn disabled">📊</span>
        </div>
      </div>
      <div className="toolbar-editor" contentEditable suppressContentEditableWarning>
        <p>Select some text and use the toolbar above to format it. This is a demo of an inaccessible toolbar component.</p>
      </div>
    </div>
  );
}
