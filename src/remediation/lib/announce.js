/**
 * Screen reader announcement utilities for post-render remediation.
 *
 * Creates and manages a live region for dynamic announcements
 * that screen readers will speak aloud.
 */

let liveRegion = null;

/**
 * Get or create the global live region element.
 * Uses aria-live="polite" and is visually hidden.
 */
function getLiveRegion() {
  if (liveRegion && document.body.contains(liveRegion)) {
    return liveRegion;
  }

  liveRegion = document.createElement('div');
  liveRegion.setAttribute('role', 'status');
  liveRegion.setAttribute('aria-live', 'polite');
  liveRegion.setAttribute('aria-atomic', 'true');

  // Visually hidden but available to screen readers
  Object.assign(liveRegion.style, {
    position: 'absolute',
    width: '1px',
    height: '1px',
    padding: '0',
    margin: '-1px',
    overflow: 'hidden',
    clip: 'rect(0, 0, 0, 0)',
    whiteSpace: 'nowrap',
    border: '0',
  });

  document.body.appendChild(liveRegion);
  return liveRegion;
}

/**
 * Announce a message to screen readers via the live region.
 * Uses a clear-then-set pattern to ensure repeated identical messages
 * are still announced.
 */
export function announce(message, priority = 'polite') {
  const region = getLiveRegion();
  region.setAttribute('aria-live', priority);

  // Clear first to force re-announcement of identical messages
  region.textContent = '';
  requestAnimationFrame(() => {
    region.textContent = message;
  });
}

/**
 * Announce assertively (interrupts current speech).
 */
export function announceAssertive(message) {
  announce(message, 'assertive');
}

/**
 * Remove the live region from the DOM.
 */
export function destroyLiveRegion() {
  if (liveRegion && document.body.contains(liveRegion)) {
    document.body.removeChild(liveRegion);
  }
  liveRegion = null;
}
