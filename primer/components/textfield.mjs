import { actionable } from '../component-mutators/actionable.mjs';
import { Component } from './component.mjs';

const defaults = {
  // action: noop,
}

export class TextField extends Component {
  /**
   *
   * @param {ComponentParams} settings
   */
  constructor(settings) {
    settings = { ...defaults, ...settings };

    super(settings);

    actionable(this);
  }

  initialize() {
    const input = document.createElement('input');
    if (this.settings.textValue) {
      input.setAttribute('value', this.settings.textValue);
    }

    this.append(input);
  }
}

customElements.define('text-field', TextField);
