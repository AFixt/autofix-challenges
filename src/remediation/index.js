/**
 * Remediation orchestrator.
 *
 * Loads and applies all component fixes. Designed to be toggled on/off
 * at runtime so the before/after state can be compared.
 *
 * Each fix module exports an `apply()` function that returns a cleanup
 * function. On disable, the orchestrator:
 * 1. Calls each fix's cleanup (removes observers and internal state)
 * 2. Reverts all tracked DOM changes (attributes, properties, event listeners)
 * 3. Removes the live region
 * 4. Cleans up __remediationHandlers properties from elements
 */

import { apply as fixAccordion } from './fixes/accordion.js';
import { apply as fixAlert } from './fixes/alert.js';
import { apply as fixBreadcrumb } from './fixes/breadcrumb.js';
import { apply as fixButton } from './fixes/button.js';
import { apply as fixCarousel } from './fixes/carousel.js';
import { apply as fixCheckbox } from './fixes/checkbox.js';
import { apply as fixCombobox } from './fixes/combobox.js';
import { apply as fixDisclosure } from './fixes/disclosure.js';
import { apply as fixFeed } from './fixes/feed.js';
import { apply as fixGrid } from './fixes/grid.js';
import { apply as fixLandmarks } from './fixes/landmarks.js';
import { apply as fixLink } from './fixes/link.js';
import { apply as fixListbox } from './fixes/listbox.js';
import { apply as fixMenuAndMenubar } from './fixes/menuAndMenubar.js';
import { apply as fixMenuButton } from './fixes/menuButton.js';
import { apply as fixMeter } from './fixes/meter.js';
import { apply as fixModal } from './fixes/modalDialog.js';
import { apply as fixMultiThumbSlider } from './fixes/multiThumbSlider.js';
import { apply as fixRadioGroup } from './fixes/radioGroup.js';
import { apply as fixSlider } from './fixes/slider.js';
import { apply as fixTable } from './fixes/sortableTable.js';
import { apply as fixSpinbutton } from './fixes/spinbutton.js';
import { apply as fixSwitch } from './fixes/switchControl.js';
import { apply as fixTabs } from './fixes/tabPanel.js';
import { apply as fixToolbar } from './fixes/toolbar.js';
import { apply as fixTooltip } from './fixes/tooltip.js';
import { apply as fixTree } from './fixes/treeView.js';
import { apply as fixTreegrid } from './fixes/treegrid.js';
import { apply as fixSplitter } from './fixes/windowSplitter.js';
import { revertAll } from './lib/tracker.js';
import { destroyLiveRegion } from './lib/announce.js';

const fixes = [
  { name: 'accordion', apply: fixAccordion },
  { name: 'alert', apply: fixAlert },
  { name: 'breadcrumb', apply: fixBreadcrumb },
  { name: 'button', apply: fixButton },
  { name: 'carousel', apply: fixCarousel },
  { name: 'checkbox', apply: fixCheckbox },
  { name: 'combobox', apply: fixCombobox },
  { name: 'disclosure', apply: fixDisclosure },
  { name: 'feed', apply: fixFeed },
  { name: 'grid', apply: fixGrid },
  { name: 'landmarks', apply: fixLandmarks },
  { name: 'link', apply: fixLink },
  { name: 'listbox', apply: fixListbox },
  { name: 'menuAndMenubar', apply: fixMenuAndMenubar },
  { name: 'menuButton', apply: fixMenuButton },
  { name: 'meter', apply: fixMeter },
  { name: 'modalDialog', apply: fixModal },
  { name: 'multiThumbSlider', apply: fixMultiThumbSlider },
  { name: 'radioGroup', apply: fixRadioGroup },
  { name: 'slider', apply: fixSlider },
  { name: 'sortableTable', apply: fixTable },
  { name: 'spinbutton', apply: fixSpinbutton },
  { name: 'switch', apply: fixSwitch },
  { name: 'tabPanel', apply: fixTabs },
  { name: 'toolbar', apply: fixToolbar },
  { name: 'tooltip', apply: fixTooltip },
  { name: 'treeView', apply: fixTree },
  { name: 'treegrid', apply: fixTreegrid },
  { name: 'windowSplitter', apply: fixSplitter },
];

let activeCleanups = [];
let isActive = false;

/**
 * Apply all remediation fixes.
 */
export function enableRemediation() {
  if (isActive) return;
  isActive = true;

  fixes.forEach((fix) => {
    try {
      const cleanup = fix.apply();
      activeCleanups.push({ name: fix.name, cleanup });
    } catch (err) {
      console.error(`[remediation] Failed to apply fix "${fix.name}":`, err);
    }
  });

  console.log('[remediation] All fixes applied.');
}

/**
 * Remove all remediation fixes.
 * Disconnects observers, reverts all DOM changes, removes event listeners.
 */
export function disableRemediation() {
  if (!isActive) return;
  isActive = false;

  // 1. Run each fix's cleanup (disconnect observers, internal state)
  activeCleanups.forEach(({ name, cleanup }) => {
    try {
      cleanup();
    } catch (err) {
      console.error(`[remediation] Failed to clean up fix "${name}":`, err);
    }
  });
  activeCleanups = [];

  // 2. Revert all tracked DOM modifications (attributes, properties, listeners)
  revertAll();

  // 3. Remove the live region element
  destroyLiveRegion();

  // 4. Clean up internal properties left on DOM elements
  document.querySelectorAll('[data-remediated]').forEach((el) => {
    el.removeAttribute('data-remediated');
  });
  document.querySelectorAll('*').forEach((el) => {
    if (el.__remediationHandlers) delete el.__remediationHandlers;
    if (el.__remSortHandler) delete el.__remSortHandler;
  });

  console.log('[remediation] All fixes reverted.');
}

/**
 * Toggle remediation on/off.
 */
export function toggleRemediation() {
  if (isActive) {
    disableRemediation();
  } else {
    enableRemediation();
  }
  return isActive;
}

/**
 * Check if remediation is currently active.
 */
export function isRemediationActive() {
  return isActive;
}
