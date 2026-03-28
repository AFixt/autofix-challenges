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
 * - Add role="heading" and aria-level to heading-like elements
 *   (.lm-page-title, .lm-section-title, .lm-sidebar-title)
 *
 * Limitations discovered:
 * - If the host page already uses semantic HTML landmarks, adding role
 *   attributes is redundant but harmless; cannot detect the outer page context
 * - Multiple navigation regions on the same page require distinct aria-labels
 *   to be distinguishable; we apply generic labels which may need customisation
 * - The demo widget is a self-contained div, so these roles apply within the
 *   widget scope only and do not represent page-level landmarks
 * - Heading levels are inferred from CSS class names (.lm-page-title→h1,
 *   .lm-section-title→h2, .lm-sidebar-title→h3); if the page context requires
 *   different levels, these guesses will produce an incorrect document outline
 */

import { setRole, setAria } from '../lib/aria.js';
import { queryAll } from '../lib/dom.js';
import { createFix } from '../lib/fixFactory.js';

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

function setHeading(el, level) {
  if (!el) return;
  const tag = el.tagName.toLowerCase();
  if (/^h[1-6]$/.test(tag)) return; // already a real heading
  setRole(el, 'heading');
  setAria(el, 'level', String(level));
}

function remediateLandmarks(widget) {
  remediateIfNeeded(widget.querySelector('.lm-header'), 'banner', null);
  remediateIfNeeded(widget.querySelector('.lm-nav'), 'navigation', 'Site navigation');
  remediateIfNeeded(widget.querySelector('.lm-main'), 'main', null);
  remediateIfNeeded(widget.querySelector('.lm-sidebar'), 'complementary', 'Sidebar');
  remediateIfNeeded(widget.querySelector('.lm-footer'), 'contentinfo', null);
  remediateIfNeeded(widget.querySelector('.lm-search'), 'search', 'Site search');

  // Add heading semantics to heading-like elements
  const pageTitle = widget.querySelector('.lm-page-title');
  setHeading(pageTitle, 1);

  const sectionTitles = queryAll('.lm-section-title', widget);
  sectionTitles.forEach((title) => setHeading(title, 2));

  const sidebarTitles = queryAll('.lm-sidebar-title', widget);
  sidebarTitles.forEach((title) => setHeading(title, 3));
}

export const apply = createFix('.landmarks-widget', remediateLandmarks);
