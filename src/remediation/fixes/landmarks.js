/**
 * Post-render remediation for the Landmarks component.
 *
 * Fixes attempted:
 * - Add role="banner" to .lm-header
 * - Add role="navigation" and aria-label to .lm-nav
 * - Add role="main" to .lm-main
 * - Add role="complementary" and aria-label to .lm-sidebar
 * - Add role="contentinfo" to .lm-footer
 * - Add role="search" and aria-label to .lm-search
 * - Ensure landmark roles do not duplicate native HTML semantics where
 *   semantic elements (<header>, <nav>, <main>, <aside>, <footer>) already exist
 *
 * Limitations discovered:
 * - If the host page already uses semantic HTML landmarks, adding role
 *   attributes is redundant but harmless; cannot detect the outer page context
 * - Multiple navigation regions on the same page require distinct aria-labels
 *   to be distinguishable; we apply generic labels which may need customisation
 * - The demo widget is a self-contained div, so these roles apply within the
 *   widget scope only and do not represent page-level landmarks
 */

import { setRole, setAria } from '../lib/aria.js';
import { observeChanges, onElementAdded } from '../lib/observer.js';

const NATIVE_ROLES = {
  header: 'banner',
  nav: 'navigation',
  main: 'main',
  aside: 'complementary',
  footer: 'contentinfo',
  form: 'form',
};

function hasNativeRole(el) {
  const tag = el.tagName.toLowerCase();
  return !!NATIVE_ROLES[tag];
}

function remediateIfNeeded(el, role, label) {
  if (!el) return;
  if (!hasNativeRole(el)) {
    setRole(el, role);
  }
  if (label) {
    setAria(el, 'label', label);
  }
}

function remediateLandmarks(widget) {
  remediateIfNeeded(widget.querySelector('.lm-header'), 'banner', null);
  remediateIfNeeded(widget.querySelector('.lm-nav'), 'navigation', 'Site navigation');
  remediateIfNeeded(widget.querySelector('.lm-main'), 'main', null);
  remediateIfNeeded(widget.querySelector('.lm-sidebar'), 'complementary', 'Sidebar');
  remediateIfNeeded(widget.querySelector('.lm-footer'), 'contentinfo', null);
  remediateIfNeeded(widget.querySelector('.lm-search'), 'search', 'Site search');
}

export function apply() {
  const cleanups = [];

  const setup = (widget) => {
    remediateLandmarks(widget);

    const stop = observeChanges(widget, () => {
      remediateLandmarks(widget);
    });
    cleanups.push(stop);
  };

  const stopWatching = onElementAdded('.landmarks-widget', setup);
  cleanups.push(stopWatching);

  return () => cleanups.forEach((fn) => fn());
}
