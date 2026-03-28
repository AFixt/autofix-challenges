/**
 * Post-render remediation for the Breadcrumb component.
 *
 * Fixes attempted:
 * - Add role="navigation" and aria-label="Breadcrumb" to the trail container
 * - Add role="list" to the trail and role="listitem" to each segment for list semantics
 * - Add role="link" and tabindex="0" to span-based breadcrumb links
 * - Add aria-current="page" to the active/current breadcrumb link
 * - Hide decorative separator characters from screen readers via aria-hidden
 * - Ensure breadcrumb links are keyboard focusable
 *
 * Limitations discovered:
 * - Cannot convert div-based separators to a true <ol>/<li> structure without
 *   breaking React's virtual DOM; role attributes are used instead
 * - aria-current is determined by the .current CSS class, which must stay in
 *   sync with router state; React re-renders may temporarily remove the class
 *   before re-painting, causing a flicker in screen reader state
 * - Separator detection relies on the .breadcrumb-sep class being consistent
 * - role="link" on a span does not provide native <a> behavior (address bar
 *   preview, right-click context menu, middle-click to open in new tab)
 */

import { setRole, setAria, setHidden, setTabIndex } from '../lib/aria.js';
import { onKeyDown } from '../lib/keyboard.js';
import { queryAll } from '../lib/dom.js';
import { createFix } from '../lib/fixFactory.js';

function remediateBreadcrumb(widget) {
  const trail = widget.querySelector('.breadcrumb-trail');

  if (trail) {
    setRole(trail, 'navigation');
    setAria(trail, 'label', 'Breadcrumb');

    // Add list semantics to trail container
    const innerList = trail;
    setRole(innerList, 'navigation');

    const segments = queryAll('.breadcrumb-segment', trail);
    segments.forEach((seg) => {
      setRole(seg, 'listitem');
    });
  }

  const separators = queryAll('.breadcrumb-sep', widget);
  separators.forEach((sep) => {
    setHidden(sep, 'true');
  });

  const links = queryAll('.breadcrumb-link', widget);
  links.forEach((link, i) => {
    if (link.classList.contains('current')) {
      setAria(link, 'current', 'page');
    } else {
      // Remove stale aria-current if class was removed during re-render
      if (link.getAttribute('aria-current')) {
        link.removeAttribute('aria-current');
      }
    }

    // Add link role and keyboard support for non-anchor fake links
    const tag = link.tagName.toLowerCase();
    if (tag !== 'a') {
      setRole(link, 'link');
      setTabIndex(link, 0);

      onKeyDown(link, `breadcrumb-link-enter-${i}`, (e) => {
        if (e.key === 'Enter') {
          e.preventDefault();
          link.click();
        }
      });
    }
  });
}

export const apply = createFix('.breadcrumb-widget', remediateBreadcrumb);
