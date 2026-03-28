import './Breadcrumb.css';

/**
 * Inaccessible Breadcrumb
 *
 * Accessibility issues:
 * 1. Uses div instead of nav element
 * 2. No aria-label="Breadcrumb" on navigation
 * 3. Separator characters (>) not hidden from screen readers
 * 4. Links are spans with onClick, not <a> elements
 * 5. No aria-current="page" on the last item
 * 6. No ordered list structure (ol/li)
 * 7. Items not keyboard focusable
 */

const crumbs = [
  { label: 'Home', href: '#' },
  { label: 'Products', href: '#' },
  { label: 'Electronics', href: '#' },
  { label: 'Smartphones', href: '#' },
  { label: 'iPhone 15', href: null },
];

export default function Breadcrumb() {
  return (
    <div className="breadcrumb-widget">
      <div className="breadcrumb-trail">
        {crumbs.map((crumb, i) => (
          <span key={i} className="breadcrumb-segment">
            {i > 0 && <span className="breadcrumb-sep"> › </span>}
            <span
              className={`breadcrumb-link ${!crumb.href ? 'current' : ''}`}
              onClick={() => crumb.href && console.log('Navigate to', crumb.label)}
            >
              {crumb.label}
            </span>
          </span>
        ))}
      </div>

      <div className="breadcrumb-page-content">
        <div className="breadcrumb-page-title">iPhone 15</div>
        <div className="breadcrumb-page-desc">
          The latest smartphone with advanced camera system, A16 Bionic chip,
          and all-day battery life.
        </div>
      </div>
    </div>
  );
}
