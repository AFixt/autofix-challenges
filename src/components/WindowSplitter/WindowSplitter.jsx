import { useState, useRef } from 'react';
import './WindowSplitter.css';

/**
 * Inaccessible Window Splitter
 *
 * Accessibility issues:
 * 1. Divider has no role="separator"
 * 2. No aria-valuenow (current position as percentage)
 * 3. No aria-valuemin / aria-valuemax
 * 4. Not keyboard focusable
 * 5. No arrow key support (Left/Right to resize)
 * 6. No Home/End for min/max positions
 * 7. No aria-label on separator
 * 8. No aria-controls linking separator to panels
 * 9. Panels have no accessible names
 * 10. No aria-orientation
 * 11. No visual focus indicator on separator
 */

const files = [
  'index.html', 'styles.css', 'app.js', 'utils.js', 'config.json',
  'README.md', 'package.json', '.gitignore', 'tsconfig.json',
];

export default function WindowSplitter() {
  const [splitPct, setSplitPct] = useState(30);
  const [selectedFile, setSelectedFile] = useState('app.js');
  const containerRef = useRef(null);

  const handleMouseDown = () => {
    const onMove = (e) => {
      const rect = containerRef.current.getBoundingClientRect();
      const pct = ((e.clientX - rect.left) / rect.width) * 100;
      setSplitPct(Math.max(15, Math.min(70, pct)));
    };
    const onUp = () => {
      document.removeEventListener('mousemove', onMove);
      document.removeEventListener('mouseup', onUp);
    };
    document.addEventListener('mousemove', onMove);
    document.addEventListener('mouseup', onUp);
  };

  return (
    <div className="splitter-widget">
      <div className="splitter-container" ref={containerRef}>
        <div className="splitter-panel splitter-sidebar" style={{ width: `${splitPct}%` }}>
          <div className="splitter-panel-header">Files</div>
          <div className="splitter-file-list">
            {files.map((f) => (
              <div
                key={f}
                className={`splitter-file ${f === selectedFile ? 'active' : ''}`}
                onClick={() => setSelectedFile(f)}
              >
                {f}
              </div>
            ))}
          </div>
        </div>

        <div className="splitter-divider" onMouseDown={handleMouseDown}>
          <div className="splitter-grip" />
        </div>

        <div className="splitter-panel splitter-main" style={{ width: `${100 - splitPct}%` }}>
          <div className="splitter-panel-header">{selectedFile}</div>
          <div className="splitter-preview">
            <pre className="splitter-code">{`// Contents of ${selectedFile}\n\nfunction main() {\n  console.log("Hello from ${selectedFile}");\n}\n\nexport default main;`}</pre>
          </div>
        </div>
      </div>
    </div>
  );
}
