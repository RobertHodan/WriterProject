import { addMutator, isNotComponent } from './utils.mjs';
import { isInteger, isArray, isBoolean, noop } from '../utils/utils.mjs';
import { isSmartValue } from '../smart-value.mjs';

let internals = {
  id: 'valuable',
  value: 0,
  smartValue: undefined,
  listeners: [],
}

const requisites = {
  callValueListeners: function (value, index) {
    for (const listener of this.valuable.listeners) {
      listener(value, index);
    }
  },
  onValueChanged: noop,
  getSmartValue: function () {
    return this.valuable.smartValue;
  },
  setSmartValue: function (smartValue) {
    this.unsetSmartValue();
    if (isSmartValue(smartValue)) {
      this.valuable.smartValue = smartValue;
      const unset = smartValue.addListener((value) => {
        this.value = value;
      });
      this.unsetSmartValue = () => {
        unset();
        this.valuable.smartValue = undefined;
        this.unsetSmartValue = noop;
      }
    } else {
      this.value = smartValue;
    }
  },
  setValue: function (value, index, skipCallback = false) {
    if (isSmartValue(this.valuable.smartValue)) {
      this.valuable.smartValue.setValue(value, this.sharedId);
      return;
    }

    if (this.getValue() === value) {
      return;
    }
    if (isBoolean(index)) {
      skipCallback = index;
    }

    if (isInteger(index) && isArray(this.value)) {
      this.value[index] = value;
      if (!skipCallback) {
        this.onValueChanged(value, index);
        this.callValueListeners(value, index);
      }
      return;
    }

    this.value = value;

    if (!skipCallback) {
      this.onValueChanged(value);
      this.callValueListeners(value);
    }
  },
  getValue: function (index) {
    if (isInteger(index) && isArray(this.value)) {
      const value = this.value[index];
      if (isSmartValue(this.valuable.smartValue)) {
        return this.valuable.smartValue.getValue();
      }
      return this.value[index];
    }

    return this.value;
  },
  addValueListener: function (callback) {
    this.valuable.listeners.push(callback);

    return () => {
      this.removeValueListener(callback);
    };
  },
  removeValueListener: function (callback) {
    const index = this.valuable.listeners.indexOf(callback);
    this.valuable.listeners.splice(index, 1);
  },
  unsetSmartValue: noop,
}

/**
 *
 * @param {Component} component
 * @param {*} settings
 */
export function valuable(component, settings) {
  if (component.isValuable) {
    return;
  }

  component.value = settings.value;
  component.isValuable = true;

  const { value, ...overrides } = settings;
  internals.value = value;

  addMutator(component, internals, requisites, overrides);
}

/**
 *
 * @param {Component | HTMLElement} component
 */
export function isValuable(component) {
  if (isNotComponent(component)) {
    return false;
  }

  return component.isValuable;
}
