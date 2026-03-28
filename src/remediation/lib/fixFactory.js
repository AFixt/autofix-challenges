/**
 * Factory for creating fix modules with standard apply/cleanup boilerplate.
 *
 * Every fix follows the same pattern: find the widget, remediate it,
 * watch for DOM changes to re-apply, and clean up on disable.
 * This factory eliminates that repetition.
 */

import { observeChanges, onElementAdded } from './observer.js';

/**
 * Create a standard fix apply() function.
 *
 * @param {string} widgetSelector - CSS selector for the widget container
 * @param {Function} remediateFn - function(widget) that applies the fix
 * @returns {Function} apply() that returns a cleanup function
 */
export function createFix(widgetSelector, remediateFn) {
  return function apply() {
    const cleanups = [];

    const setup = (widget) => {
      remediateFn(widget);

      const stop = observeChanges(widget, () => {
        remediateFn(widget);
      });
      cleanups.push(stop);
    };

    const stopWatching = onElementAdded(widgetSelector, setup);
    cleanups.push(stopWatching);

    return () => cleanups.forEach((fn) => fn());
  };
}
