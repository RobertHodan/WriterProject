import { actionable, isActionable } from '../component-mutators/actionable.mjs';
import { noop } from '../utils/utils.mjs';
import { Component } from './component.mjs';

/**
 * @typedef {Object} ComponentParams
 * @property {Function?} action
 * @property {boolean?} keyboardFocusable
 */

const defaults = {
  action: noop,
  keyboardFocusable: true,
}

export class Button extends Component {
  /**
   *
   * @param {ComponentParams} settings
   */
  constructor(settings) {
    settings = { ...defaults, ...settings };

    settings.tagName = settings.keyboardFocusable ? 'button' : 'div';
    super(settings);

    actionable(this);

    if (settings.action) {
      this.setAction(settings.action);
    }
  }
}

customElements.define('button-component', Button);
