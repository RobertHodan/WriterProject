import { actionable } from '../component-mutators/actionable.mjs';
import { valuable } from '../component-mutators/valuable.mjs';
import { clamp, isValid, noop } from '../utils/utils.mjs';
import { Component } from './component.mjs';

/**
 * @typedef {Object} ComponentParams
 * @property {number?} max
 * @property {number?} min
 * @property {number?} step
 * @property {number?} value
 * @property {number?} toDecimal
 * @property {boolean?} keyboardFocusable
 * @property {Function?} onFocus
 * @property {Function?} onBlur
 */

const defaults = {
  step: 10,
  value: 0,
  keyboardFocusable: true,
  onFocus: noop,
  onBlur: noop,
  onChanged: noop,
  asInt: false,
  precision: -1,
}

export class NumberInput extends Component {
  /**
   *
   * @param {ComponentParams} settings
   */
  constructor(settings) {
    settings = {...defaults, ...settings};

    settings.tagName = 'input',
    super(settings);

    actionable(this, {
      enableDefaultEvents: false,
    });

    valuable(this, {
      value: settings.value,
    });

    this.stepValue = settings.step;
    this.onBlur = settings.onBlur;
    this.onFocus = settings.onFocus;
    this.onChanged = settings.onChanged;
    this.onWorkingChanged = settings.onWorkingChanged;
    this.keyboardFocusable = settings.keyboardFocusable;
    this.toDecimal = settings.toDecimal;
    this.asInt = settings.asInt;
    this.precision = settings.precision || -1;

    const inputMode = this.asInt ? `numeric` : `decimal`;
    this.el.setAttribute('inputmode', inputMode);
    this.el.setAttribute('step', settings.step);
    this.el.setAttribute('value', settings.value);
    // this.el.setAttribute('type', "number");

    if (!this.keyboardFocusable) {
      this.el.setAttribute('tabIndex', -1);
    }

    if (settings.max != undefined) {
      this.max = settings.max;
    }

    if (settings.min != undefined) {
      this.min = settings.min;
      this.positiveOnly = this.min >= 0;
    }

    this.el.addEventListener('focus', () => {
      this._setFocusFlag(true);
    });
    this.el.addEventListener('blur', () => {
      this._setFocusFlag(false);
      this.setValue(this.el.value);
    });

    this.el.addEventListener('input', (e) => {
      this.setValue(this.el.value);
    });
  }

  action() {
    if (this.isFocused) {
      this.blur();
      this.setValue(this.value);
    } else {
      this.focus();
    }
  }

  _setFocusFlag(isFocused) {
    this.isFocused = isFocused;

    if (this.isFocused) {
      this.onFocus();
    } else {
      this.onBlur();
    }
  }

  focus() {
    this._setFocusFlag(true);
    this.el.focus();
  }

  blur() {
    this._setFocusFlag(false);
    this.el.blur();
  }

  stepUp() {
    this.step(this.stepValue);
  }

  stepDown() {
    this.step(-this.stepValue);
  }

  step(value) {
    let newValue = this.value + value;

    this.setValue(newValue);
  }

  _validateInput(value) {
    value = Number.parseFloat(value);

    if (isValid(this.min) && value < this.min) {
      value = this.min;
    }
    if (isValid(this.max) && value > this.max) {
      value = this.max;
    }

    if (Number.isNaN(value)) {
      value = 0;
    }

    return value;
  }

  _parseNumberAsString(value) {
    let number = '';
    let hasDecimal = false;
    for (let char of value) {
      if (char == '.') {
        if (this.asInt) {
          break;
        }

        if (value.indexOf(char) == 0) {
          number += '0';
        }

        if (!hasDecimal) {
          hasDecimal = true;
          number += char;
          continue;
        }
      }

      if (char == '-' && !this.positiveOnly) {
        if (number.includes('-')) {
          number = number.replaceAll('-', '');
        } else {
          number = '-' + number;
        }
      }

      if (char < '0' || char > '9') {
        continue;
      }

      const abs = number.replaceAll('-', '');
      if (abs[0] === '0') {
        if (abs.length > 0 && abs[1] != '.') {
          number = number.replace(abs[0], '');
        }
      }

      number += char;
    }

    return number;
  }

  update() {
    let value = this.value;
    if (this.toDecimal) {
      value = Number.parseFloat(value.toFixed(2));
    }
    if (this.precision > 0) {
      value = value.toFixed(this.precision);
    }
    this.el.value = value;
  }

  setValue(value, skipCallback) {
    if (this.isFocused) {
      if (typeof(value) == 'number') {
        value = `${value}`;
      }
      value = this._parseNumberAsString(value);
      this.el.value = value;
      return;
    }
    value = this._validateInput(value);

    this._setValue(value, skipCallback);

    this.update();

    if (!skipCallback) {
      this.onChanged(this.value);
      this.onValueChanged(this.value);
    }
  }
}
