import './Link.css';

/**
 * Inaccessible Link
 *
 * Accessibility issues:
 * 1. Links are spans with onClick handlers, not <a> elements
 * 2. No role="link" on span-based links
 * 3. Not keyboard focusable (no tabindex)
 * 4. No href attribute
 * 5. "Opens in new window" links have no warning
 * 6. Image links have no accessible name
 * 7. Download links don't indicate file type/size
 * 8. No underline or visual link affordance (color-only)
 * 9. Card links have no semantic link structure
 * 10. No visited state differentiation
 */

export default function LinkDemo() {
  return (
    <div className="link-widget">
      <div className="link-section">
        <div className="link-section-title">Inline Links</div>
        <p className="link-paragraph">
          Read our <span className="fake-link" onClick={() => {}}>getting started guide</span> to
          learn more. You can also check the <span className="fake-link" onClick={() => {}}>API documentation</span> or
          visit our <span className="fake-link" onClick={() => {}}>community forum</span>.
        </p>
      </div>

      <div className="link-section">
        <div className="link-section-title">External Links</div>
        <div className="link-list">
          <span className="fake-link external" onClick={() => {}}>GitHub Repository</span>
          <span className="fake-link external" onClick={() => {}}>Stack Overflow</span>
          <span className="fake-link external" onClick={() => {}}>MDN Web Docs</span>
        </div>
      </div>

      <div className="link-section">
        <div className="link-section-title">Image Links</div>
        <div className="image-links">
          <span className="image-link" onClick={() => {}}>
            <div className="image-link-img" style={{ background: '#4f46e5' }} />
          </span>
          <span className="image-link" onClick={() => {}}>
            <div className="image-link-img" style={{ background: '#0891b2' }} />
          </span>
          <span className="image-link" onClick={() => {}}>
            <div className="image-link-img" style={{ background: '#059669' }} />
          </span>
        </div>
      </div>

      <div className="link-section">
        <div className="link-section-title">Download Links</div>
        <div className="link-list">
          <span className="fake-link" onClick={() => {}}>Annual Report</span>
          <span className="fake-link" onClick={() => {}}>Brand Guidelines</span>
          <span className="fake-link" onClick={() => {}}>Press Kit</span>
        </div>
      </div>

      <div className="link-section">
        <div className="link-section-title">Card Links</div>
        <div className="card-links">
          <div className="card-link" onClick={() => {}}>
            <div className="card-link-title">Documentation</div>
            <div className="card-link-desc">Comprehensive guides and reference materials</div>
          </div>
          <div className="card-link" onClick={() => {}}>
            <div className="card-link-title">Tutorials</div>
            <div className="card-link-desc">Step-by-step learning resources</div>
          </div>
        </div>
      </div>
    </div>
  );
}
