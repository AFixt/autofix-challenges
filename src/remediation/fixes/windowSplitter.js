/**
 * Post-render remediation for the Window Splitter component.
 *
 * Fixes attempted:
 * - Add role="separator" and aria-orientation="vertical" to .splitter-divider
 * - Add aria-valuenow reflecting the divider's current position as a percentage
 * - Add aria-valuemin="0" and aria-valuemax="100"
 * - Add aria-valuetext as a human-readable description (e.g. "30% sidebar width")
 * - Add aria-label to identify the splitter's purpose
 * - Add aria-controls referencing both panels (.splitter-sidebar, .splitter-main)
 * - Add tabindex="0" to make the divider keyboard focusable
 * - Add Left/Right (or Up/Down) arrow keys to resize panels by a step amount
 * - Add Page Up/Down for larger resize increments
 * - Add Home/End to snap to minimum/maximum positions
 *
 * Limitations discovered:
 * - The actual panel sizes are controlled by React state; arrow key events
 *   dispatch a custom event and update aria-valuenow optimistically, but the
 *   component must listen for the custom event to actually resize panels
 * - aria-valuenow is inferred from the sidebar panel's current computed width
 *   as a percentage of the container width; this requires the container to have
 *   a non-zero width at remediation time
 * - Orientation is assumed vertical (left/right resize); horizontal splitters
 *   would require Up/Down arrows and aria-orientation="horizontal"
 */

import { setRole, setAria, setTabIndex, ensureId } from '../lib/aria.js';
import { onKeyDown } from '../lib/keyboard.js';
import { queryAll } from '../lib/dom.js';
import { observeChanges, onElementAdded } from '../lib/observer.js';

function getSplitterValue(divider, container) {
  if (divider.dataset.value !== undefined) {
    return parseFloat(divider.dataset.value);
  }
  const existing = divider.getAttribute('aria-valuenow');
  if (existing) return parseFloat(existing);

  // Infer from sidebar width as percentage of container
  const sidebar = container?.querySelector('.splitter-sidebar');
  if (sidebar && container) {
    const containerWidth = container.getBoundingClientRect().width;
    if (containerWidth > 0) {
      const sidebarWidth = sidebar.getBoundingClientRect().width;
      return Math.round((sidebarWidth / containerWidth) * 100);
    }
  }
  return 30; // Default fallback
}

function remediateSplitter(widget) {
  const splitters = queryAll('.splitter-container', widget);

  splitters.forEach((container, ci) => {
    const divider = container.querySelector('.splitter-divider');
    const sidebar = container.querySelector('.splitter-sidebar');
    const main = container.querySelector('.splitter-main');

    if (!divider) return;

    setRole(divider, 'separator');
    setTabIndex(divider, 0);
    ensureId(divider, `splitter-divider-${ci}`);
    setAria(divider, 'orientation', 'vertical');
    setAria(divider, 'valuemin', '0');
    setAria(divider, 'valuemax', '100');

    const value = getSplitterValue(divider, container);
    setAria(divider, 'valuenow', String(value));
    setAria(divider, 'valuetext', `Sidebar ${value}% wide`);

    const label = divider.getAttribute('aria-label') ||
      divider.dataset.label ||
      'Resize panels';
    setAria(divider, 'label', label);

    // aria-controls referencing both panels
    const controlledIds = [];
    if (sidebar) {
      ensureId(sidebar, `splitter-sidebar-${ci}`);
      controlledIds.push(sidebar.id);
    }
    if (main) {
      ensureId(main, `splitter-main-${ci}`);
      controlledIds.push(main.id);
    }
    if (controlledIds.length > 0) {
      setAria(divider, 'controls', controlledIds.join(' '));
    }

    const step = parseFloat(divider.dataset.step ?? '5');
    const largeStep = parseFloat(divider.dataset.largeStep ?? '20');

    onKeyDown(divider, `splitter-keys-${ci}`, (e) => {
      let current = getSplitterValue(divider, container);
      let newValue = current;

      switch (e.key) {
        case 'ArrowLeft':
        case 'ArrowUp':
          e.preventDefault();
          newValue = Math.max(0, current - step);
          break;
        case 'ArrowRight':
        case 'ArrowDown':
          e.preventDefault();
          newValue = Math.min(100, current + step);
          break;
        case 'PageUp':
          e.preventDefault();
          newValue = Math.min(100, current + largeStep);
          break;
        case 'PageDown':
          e.preventDefault();
          newValue = Math.max(0, current - largeStep);
          break;
        case 'Home':
          e.preventDefault();
          newValue = 0;
          break;
        case 'End':
          e.preventDefault();
          newValue = 100;
          break;
        default:
          return;
      }

      if (newValue !== current) {
        setAria(divider, 'valuenow', String(newValue));
        setAria(divider, 'valuetext', `Sidebar ${newValue}% wide`);
        divider.dataset.value = String(newValue);

        divider.dispatchEvent(new CustomEvent('splitter-resize', {
          bubbles: true,
          detail: { value: newValue },
        }));
      }
    });
  });
}

export function apply() {
  const cleanups = [];

  const setup = (widget) => {
    remediateSplitter(widget);

    const stop = observeChanges(widget, () => {
      remediateSplitter(widget);
    });
    cleanups.push(stop);
  };

  const stopWatching = onElementAdded('.splitter-widget', setup);
  cleanups.push(stopWatching);

  return () => cleanups.forEach((fn) => fn());
}
