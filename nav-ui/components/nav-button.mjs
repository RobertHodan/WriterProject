import { Button } from '../../primer/components/button.mjs';
import { applyClassName } from '../../primer/utils/element.mjs';
import { noop } from '../../primer/utils/utils.mjs';
import { createDynamicIcon } from '../dynamic-icon.mjs';

/**
 * @typedef {Object} ComponentParams
 * @property {Function?} action
 * @property {boolean?} keyboardFocusable
 * @property {Function?} onClick
 * @property {string?} navAction
 */

const defaults = {
  action: noop,
  keyboardFocusable: true,
  navAction: '',
  className: 'nav-btn',
}

export class NavButton extends Button {
  /**
   *
   * @param {ComponentParams} settings
   */
  constructor(settings) {
    settings = {...defaults, ...settings};

    super(settings);

    this.navAction = settings.navAction;

    this.dynamicIcon = createDynamicIcon(this.navAction);
    this.append(this.dynamicIcon);

  }

  setIconSettings(settings) {
    const {
      className,
    } = settings;

    applyClassName(this.dynamicIcon.el, className);
  }
}
