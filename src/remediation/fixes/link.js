/**
 * Post-render remediation for the Link component.
 *
 * Fixes attempted:
 * - Add role="link" and tabindex="0" to .fake-link elements (non-anchor links)
 * - Add Enter key activation to fake links (Space is NOT standard for links)
 * - Add aria-label to .image-link elements that contain only an image and no text
 * - Add aria-label to .card-link elements using visible card title text
 * - Warn (via aria-label fallback) when no accessible name can be computed
 *
 * Limitations discovered:
 * - Links should be <a> elements; role="link" on a div does not provide
 *   browser address bar preview or right-click context menu options
 * - Space key intentionally NOT used for link activation (links use Enter,
 *   buttons use Enter and Space — this distinction matters for screen readers)
 * - Image link label is attempted from alt text, aria-label, or title;
 *   if the image has no alt and no title, the label will be empty/generic
 * - Card links with multiple text nodes use the first heading found; if no
 *   heading exists, all text content is concatenated and may be verbose
 */

import { setRole, setAria, setTabIndex, ensureId } from '../lib/aria.js';
import { onKeyDown } from '../lib/keyboard.js';
import { queryAll } from '../lib/dom.js';
import { observeChanges, onElementAdded } from '../lib/observer.js';

function remediateLink(widget) {
  // Fake links (div/span acting as links)
  const fakeLinks = queryAll('.fake-link', widget);
  fakeLinks.forEach((link, i) => {
    const tag = link.tagName.toLowerCase();
    if (tag !== 'a') {
      setRole(link, 'link');
      setTabIndex(link, 0);

      onKeyDown(link, `fake-link-enter-${i}`, (e) => {
        if (e.key === 'Enter') {
          e.preventDefault();
          link.click();
        }
      });
    }
  });

  // Image links — need accessible name from image alt or explicit label
  const imageLinks = queryAll('.image-link', widget);
  imageLinks.forEach((link, i) => {
    const img = link.querySelector('img');
    const existingLabel = link.getAttribute('aria-label');

    if (!existingLabel) {
      const label =
        (img && img.getAttribute('alt')) ||
        link.getAttribute('title') ||
        link.textContent.trim() ||
        'Link';
      setAria(link, 'label', label);
    }

    if (img && !img.getAttribute('alt')) {
      // Image inside a labelled link should be hidden from AT
      setAria(img, 'hidden', 'true');
    }

    const tag = link.tagName.toLowerCase();
    if (tag !== 'a') {
      setRole(link, 'link');
      setTabIndex(link, 0);
      onKeyDown(link, `img-link-enter-${i}`, (e) => {
        if (e.key === 'Enter') {
          e.preventDefault();
          link.click();
        }
      });
    }
  });

  // Card links — use card heading text as accessible label
  const cardLinks = queryAll('.card-link', widget);
  cardLinks.forEach((link, i) => {
    const existingLabel = link.getAttribute('aria-label');
    if (!existingLabel) {
      const heading = link.querySelector('h1, h2, h3, h4, h5, h6');
      const label =
        (heading && heading.textContent.trim()) ||
        link.textContent.trim().slice(0, 80) ||
        'Card link';
      setAria(link, 'label', label);
    }

    const tag = link.tagName.toLowerCase();
    if (tag !== 'a') {
      setRole(link, 'link');
      setTabIndex(link, 0);
      onKeyDown(link, `card-link-enter-${i}`, (e) => {
        if (e.key === 'Enter') {
          e.preventDefault();
          link.click();
        }
      });
    }
  });
}

export function apply() {
  const cleanups = [];

  const setup = (widget) => {
    remediateLink(widget);

    const stop = observeChanges(widget, () => {
      remediateLink(widget);
    });
    cleanups.push(stop);
  };

  const stopWatching = onElementAdded('.link-widget', setup);
  cleanups.push(stopWatching);

  return () => cleanups.forEach((fn) => fn());
}
