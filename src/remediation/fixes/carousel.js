/**
 * Post-render remediation for the Carousel component.
 *
 * Fixes attempted:
 * - Add role="region" and aria-label="Image carousel" to the viewport container
 * - Add role="group" and aria-label (e.g. "Slide 1 of N") to each slide
 * - Add role="button", tabindex, and aria-label to prev/next controls
 * - Add role="button", tabindex, and aria-label to dot indicators
 * - Add aria-live="polite" to the viewport so slide changes are announced
 * - Add keyboard activation (Enter/Space) to prev/next buttons and dots
 * - Add Left/Right arrow key navigation between slides via the viewport
 * - Add aria-label to slide images that have no alt text
 *
 * Limitations discovered:
 * - Slide count is computed at remediation time; if slides are added/removed
 *   dynamically the labels will be stale until MutationObserver fires
 * - aria-live="polite" on the viewport will announce every slide change;
 *   if auto-play is active, this becomes very noisy for screen reader users —
 *   the component itself should pause auto-play on focus, which cannot be
 *   enforced purely via attribute remediation
 * - Dot indicators have no accessible label beyond their ordinal position
 * - Image labels are derived from nearby slide title text; if slides have no
 *   title element, the image receives a generic ordinal label
 */

import { setRole, setAria, setTabIndex, ensureId } from '../lib/aria.js';
import { makeClickable, arrowNavigation } from '../lib/keyboard.js';
import { queryAll } from '../lib/dom.js';
import { createFix } from '../lib/fixFactory.js';

function remediateCarousel(widget) {
  const viewport = widget.querySelector('.carousel-viewport');
  const slides = queryAll('.carousel-slide', widget);
  const prevBtn = widget.querySelector('.carousel-prev');
  const nextBtn = widget.querySelector('.carousel-next');
  const dots = queryAll('.carousel-dot', widget);
  const total = slides.length;

  if (viewport) {
    setRole(viewport, 'region');
    setAria(viewport, 'label', 'Image carousel');
    setAria(viewport, 'live', 'polite');
    setAria(viewport, 'atomic', 'false');
    ensureId(viewport, 'carousel-viewport');
  }

  slides.forEach((slide, i) => {
    setRole(slide, 'group');
    setAria(slide, 'label', `Slide ${i + 1} of ${total}`);
    ensureId(slide, `carousel-slide`);

    // Add accessible labels to images within the slide
    const imgs = queryAll('img', slide);
    imgs.forEach((img) => {
      if (!img.getAttribute('alt') || img.getAttribute('alt') === '') {
        const title = slide.querySelector('.slide-title');
        const label = title ? title.textContent.trim() : `Slide ${i + 1} image`;
        img.setAttribute('alt', label);
      }
    });
  });

  if (prevBtn) {
    const tag = prevBtn.tagName.toLowerCase();
    if (tag !== 'button') {
      setRole(prevBtn, 'button');
      setTabIndex(prevBtn, 0);
      makeClickable(prevBtn, 'carousel-prev');
    }
    setAria(prevBtn, 'label', 'Previous slide');
  }

  if (nextBtn) {
    const tag = nextBtn.tagName.toLowerCase();
    if (tag !== 'button') {
      setRole(nextBtn, 'button');
      setTabIndex(nextBtn, 0);
      makeClickable(nextBtn, 'carousel-next');
    }
    setAria(nextBtn, 'label', 'Next slide');
  }

  dots.forEach((dot, i) => {
    const tag = dot.tagName.toLowerCase();
    if (tag !== 'button') {
      setRole(dot, 'button');
      setTabIndex(dot, 0);
      makeClickable(dot, `carousel-dot-${i}`);
    }
    const isActive = dot.classList.contains('active');
    setAria(dot, 'label', `Go to slide ${i + 1}`);
    setAria(dot, 'pressed', String(isActive));
  });

  if (viewport && slides.length > 0) {
    arrowNavigation(viewport, '.carousel-slide', {
      direction: 'horizontal',
      wrap: true,
      homeEnd: false,
      name: 'carouselArrowNav',
    });
  }
}

export const apply = createFix('.carousel-widget', remediateCarousel);
