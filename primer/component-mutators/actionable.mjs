import { addMutator } from './utils.mjs';
import { noop } from '../utils/utils.mjs';

/**
 * @typedef {Object} Actionable
 * @property {Function} action
 */
const requisites = {
  action: function () {
    this._onAction();
  },
  onClick: noop,
  onDown: noop,
  down: function () {
    isDown = true;
    this.onDown();

    this.action();
    if (this.actionable.continuousActionOnHold) {
      this.repeater();
    } else {
    }
  },
  onRelease: noop,
  release: function () {
    this.onRelease();

    this.actionable.isDown = false;
    this.actionable.autoCooldown = this.actionable.autoCooldownDefault;
    clearTimeout(this.actionable.timeout);
  },
  repeater: function () {
    if (this.actionable.enableDefaultEvents && this.actionable.continuousActionOnHold) {
      if (!this.actionable.isDown) {
        return;
      }

      this.actionable.timeout = setTimeout(() => {
        this.actionable.autoCooldown -= this.actionable.autoCooldownStep;
        if (this.actionable.autoCooldown < this.actionable.autoCooldownMin) {
          this.actionable.autoCooldown = this.actionable.autoCooldownMin;
        }
        this.action();
        this.repeater();
      }, this.actionable.autoCooldown);
    }
  },
  _onAction: noop,
  setAction: function (actionCallback) {
    this._onAction = actionCallback || noop;
  },
}

const internals = {
  id: 'actionable',
  continuousActionOnHold: true,
  autoCooldownDefault: 600,
  autoCooldownMin: 50,
  autoCooldownStep: 300,
  autoCooldown: undefined, // Set to default on initialization
  isDown: false,
  timeout: undefined,
}

/**
 *
 * @param {Component} component
 * @param {Actionable} settings
 */
export function actionable(component, settings) {
  if (component.isActionable) {
    return;
  }

  component.isActionable = true;

  addMutator(component, internals, requisites, settings);

  if (settings && settings.enableDefaultEvents) {
    component.onClick = () => {
      component.action();
    };

    if (settings.onClick != noop) {
      component.onClick = settings.onClick;
    }

    component.addEventListener('mousedown', () => {
      component.down();
    });
    component.addEventListener(document, 'mouseup', () => {
      component.release();
    });
    component.addEventListener(window, 'blur', () => {
      component.release();
    });
  }
}

export function isActionable(component) {
  if (isNotComponent(component)) {
    return false;
  }

  return component.isActionable;
}
