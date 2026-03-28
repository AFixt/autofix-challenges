import './Landmarks.css';

/**
 * Inaccessible Landmarks
 *
 * Accessibility issues:
 * 1. Header is a div, not <header> — no role="banner"
 * 2. Navigation is a div, not <nav> — no role="navigation"
 * 3. Main content is a div, not <main> — no role="main"
 * 4. Sidebar is a div, not <aside> — no role="complementary"
 * 5. Footer is a div, not <footer> — no role="contentinfo"
 * 6. Search is a div with input, no role="search"
 * 7. No skip navigation link
 * 8. Multiple nav regions not differentiated with aria-label
 * 9. No heading hierarchy (h1, h2, etc.)
 */

export default function Landmarks() {
  return (
    <div className="landmarks-widget">
      <div className="lm-header">
        <div className="lm-logo">Acme Corp</div>
        <div className="lm-nav">
          <span className="lm-nav-link">Home</span>
          <span className="lm-nav-link">About</span>
          <span className="lm-nav-link">Products</span>
          <span className="lm-nav-link">Blog</span>
          <span className="lm-nav-link">Contact</span>
        </div>
        <div className="lm-search">
          <input type="text" className="lm-search-input" placeholder="Search..." />
        </div>
      </div>

      <div className="lm-body">
        <div className="lm-main">
          <div className="lm-page-title">Welcome to Acme Corp</div>
          <div className="lm-content-block">
            <div className="lm-section-title">Latest Updates</div>
            <p>We are excited to announce our newest product line launching next month.
               Stay tuned for more details about innovative solutions designed to transform your workflow.</p>
          </div>
          <div className="lm-content-block">
            <div className="lm-section-title">Featured Article</div>
            <p>Building accessible web applications is not just a legal requirement — it is
               the right thing to do. Learn how our team approaches inclusive design.</p>
          </div>
        </div>
        <div className="lm-sidebar">
          <div className="lm-sidebar-title">Quick Links</div>
          <div className="lm-sidebar-links">
            <span className="lm-sidebar-link">Documentation</span>
            <span className="lm-sidebar-link">API Reference</span>
            <span className="lm-sidebar-link">Support Center</span>
            <span className="lm-sidebar-link">Community Forum</span>
          </div>
          <div className="lm-sidebar-title" style={{ marginTop: 20 }}>Categories</div>
          <div className="lm-sidebar-links">
            <span className="lm-sidebar-link">Engineering</span>
            <span className="lm-sidebar-link">Design</span>
            <span className="lm-sidebar-link">Product</span>
          </div>
        </div>
      </div>

      <div className="lm-footer">
        <div className="lm-footer-text">© 2024 Acme Corp. All rights reserved.</div>
        <div className="lm-footer-nav">
          <span className="lm-footer-link">Privacy Policy</span>
          <span className="lm-footer-link">Terms of Service</span>
          <span className="lm-footer-link">Cookie Settings</span>
        </div>
      </div>
    </div>
  );
}
