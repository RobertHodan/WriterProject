/**
   * @description Returns an icon that corresponds to a given menu action
   * Auto-updates once the element is connected to NavUI (via .connectParent)
   * @param {string} navAction
   */

/**
 * @typedef {Object} DynamicIcon
 * @property {string | HTMLElement} content
 * @property {string?} tagName
 * @property {string} className
 * @property {function} setContent
 * @property {string} key
 */

import { Component } from "../primer/components/component.mjs";
import { NAVACTIONS } from "./nav-actions.mjs";

/**
 *
 * @param {array<string>} navAction
 * @returns {DynamicIcon}
 */
export function createDynamicIcon(navAction) {
  if (!navAction || !Object.keys(NAVACTIONS).includes(navAction.toUpperCase())) {
   console.warn('No such navAction exists');
  }

  const dyn = new Component({
    className: 'nui-dyn-icon',
   });
   dyn.key = navAction;

   return dyn;
}
