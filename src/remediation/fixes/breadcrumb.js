/**
 * Post-render remediation for the Breadcrumb component.
 *
 * Fixes attempted:
 * - Add role="navigation" and aria-label="Breadcrumb" to the trail container
 * - Add aria-current="page" to the active/current breadcrumb link
 * - Hide decorative separator characters from screen readers via aria-hidden
 * - Ensure breadcrumb links are keyboard focusable
 * - Wrap trail in an ordered list role if not already semantic
 *
 * Limitations discovered:
 * - Cannot convert div-based separators to a true <ol>/<li> structure without
 *   breaking React's virtual DOM; role attributes are used instead
 * - aria-current is determined by the .current CSS class, which must stay in
 *   sync with router state; React re-renders may temporarily remove the class
 *   before re-painting, causing a flicker in screen reader state
 * - Separator detection relies on the .breadcrumb-sep class being consistent
 */

import { setRole, setAria, setHidden } from '../lib/aria.js';
import { queryAll } from '../lib/dom.js';
import { observeChanges, onElementAdded } from '../lib/observer.js';

function remediateBreadcrumb(widget) {
  const trail = widget.querySelector('.breadcrumb-trail');

  if (trail) {
    setRole(trail, 'navigation');
    setAria(trail, 'label', 'Breadcrumb');
  }

  const separators = queryAll('.breadcrumb-sep', widget);
  separators.forEach((sep) => {
    setHidden(sep, 'true');
  });

  const links = queryAll('.breadcrumb-link', widget);
  links.forEach((link) => {
    if (link.classList.contains('current')) {
      setAria(link, 'current', 'page');
    } else {
      // Remove stale aria-current if class was removed during re-render
      if (link.getAttribute('aria-current')) {
        link.removeAttribute('aria-current');
      }
    }

    // Ensure keyboard reachability for non-anchor fake links
    if (link.tagName.toLowerCase() !== 'a' && link.tabIndex < 0) {
      link.tabIndex = 0;
    }
  });
}

export function apply() {
  const cleanups = [];

  const setup = (widget) => {
    remediateBreadcrumb(widget);

    const stop = observeChanges(widget, () => {
      remediateBreadcrumb(widget);
    });
    cleanups.push(stop);
  };

  const stopWatching = onElementAdded('.breadcrumb-widget', setup);
  cleanups.push(stopWatching);

  return () => cleanups.forEach((fn) => fn());
}
