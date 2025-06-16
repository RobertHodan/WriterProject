import { addEventListener, clamp, isArray, isNotArray, isNotNumber, isNotString, isNumber, isString, noop } from '../utils/utils.mjs';
import { Listener } from './listener.mjs';

/**
 * @typedef {Object} ComponentParams
 */

const defaults = {
}

export class InputManager {
  /**
   *
   * @param {ComponentParams} settings
   */
  constructor(settings) {
    settings = { ...defaults, ...settings };

    this.enabled = true;
    this.preventDefault = true;
    this.inputEnabledMap = {
      'keyboard': this.enabled,
    };

    this.removeKeyboardListener = noop;
    this.removeMouseListener = noop;

    this.keyToActionMap = {};
    this.actionActivityMap = {};
    this.keyActivityMap = {};

    /**
     * {
     *  'inputId': {
     *      'action': ['key']
     *  }
     * }
     */
    this.actionToKeyMapByInputType = {};

    this.listener = new Listener({ tag: 'InputManager' });

    this.isUpdating = false;

    /**
     * {
     *  action: [string]
     *  repeatedCount: [number]
     *  timestampPrev: [number]
     *  updateRate: [number]
     * }
     */
    this.actionActivityData = {};
    // Measured in milliseconds
    this.updateRateStep = 100;
    this.updateRateMin = 16;
    this.updateRateDefault = 500;

    this.inputActiveLast = 'keyboard';

    this.isCtrl = 0;

    if (this.isActive('keyboard')) {
      this.keyboardListenerToggle(true);
      this.mouseListenerToggle(true);
    }

    window.addEventListener('blur', () => {
      // this.actionActivityMap = {};
    });

    this.start();
  }

  start() {
    this.isUpdating = true;
    window.requestAnimationFrame((timestamp) => this.update(timestamp));
  }

  stop() {
    this.isUpdating = false;
  }

  update(timestamp) {
    const actions = Object.keys(this.actionActivityData);
    for (const action of actions) {
      const actionData = this.actionActivityData[action];
      const { timestampPrev, updateRate } = actionData;
      const timeDiff = timestamp - timestampPrev;

      if (timestampPrev && timeDiff < updateRate) {
        continue;
      }

      actionData.timestampPrev = timestamp;

      actionData.updateRate -= this.updateRateStep;
      if (actionData.updateRate < this.updateRateMin) {
        actionData.updateRate = this.updateRateMin;
      }

      actionData.repeatedCount += 1;
      const isRepeat = actionData.repeatedCount > 1;

      this.listener.callAction('action', action, isRepeat);
    }

    if (this.isUpdating) {
      window.requestAnimationFrame((timestamp) => this.update(timestamp));
    }
  }

  actionUpdateStart(action) {
    const activityData = this._createActionActivityData(action);
    this.actionActivityData[action] = activityData;
  }

  actionUpdateStop(action) {
    delete this.actionActivityData[action];
  }

  _createActionActivityData(action) {
    return {
      repeatedCount: 0,
      timestampPrev: undefined,
      updateRate: this.updateRateDefault,
      action,
    };
  }

  mouseListenerToggle(state) {
    if (this.removeMouseListener != noop || !state) {
      this.removeMouseListener();
    }

    if (state) {
      this.removeMouseListener = this._addMouseListener();
    }
  }

  keyboardListenerToggle(state) {
    if (this.removeKeyboardListener != noop || !state) {
      this.removeKeyboardListener();
    }

    if (state) {
      this.removeKeyboardListener = this._addKeyboardListener();
    }
  }

  isActive(inputType) {
    if (isNotString(inputType)) {
      return false;
    }

    if (!this.enabled) {
      return false;
    }

    return this.inputEnabledMap[inputType.toLowerCase()];
  }

  setBindings(inputId, bindings) {
    const actions = Object.keys(bindings);
    inputId = this._getInputId(inputId);
    const actionToKeyMap = this._getActionToKeyMap(inputId);

    for (let action of actions) {
      let keys = bindings[action];
      if (isNotArray(keys)) {
        keys = [keys];
      }

      actionToKeyMap[action] = keys;

      for (const key of keys) {
        if (isNotString(key)) {
          continue;
        }
        this._setBinding(inputId + key, action);
      }
    }
  }

  listenToActions(callback) {
    this.listener.setCallback('action', callback);
  }

  _setBinding(id, value) {
    const actions = this.keyToActionMap[id] || [];

    actions.push(value);

    this.keyToActionMap[id] = actions;
  }

  _getActionToKeyMap(inputId) {
    const actionToKeyMap = this.actionToKeyMapByInputType[inputId] || {};
    this.actionToKeyMapByInputType[inputId] = actionToKeyMap;

    return actionToKeyMap;
  }

  // returns either 'k:' or 'c1:', assuming the number provided is '1'. Or 'c2:' if the number is '2'.
  _getInputId(inputId) {
    if (inputId.includes('k')) {
      return 'k:';
    } else {
      const num = isNumber(inputId) ? inputId : inputId.replace(/[^0-9]/g, '');
      return `c${num}:`;
    }
  }

  listenToInputChanged(callback) {
    this.listener.setCallback('inputChanged', callback);
  }

  inputTypeChanged(inputType) {
    this.inputActiveLast = inputType;

    this.listener.callAction('inputChanged', inputType);
  }

  inputTypeRefresh() {
    this.inputTypeChanged(this.inputActiveLast);
  }

  callActions(actions, inputType = 'keyboard', strength = 1) {
    for (const action of actions) {
      this.listener.callAction('action', action, false, strength);
    }

    if (inputType != this.inputActiveLast) {
      this.inputTypeChanged(inputType);
    }
  }

  actionIncrement(action, inputType = 'keyboard') {
    let num = this.actionActivityMap[action] || 0;

    if (isNotNumber(num)) {
      console.warn('Input Manager: Could not increment action - action number is invalid');
      return;
    }

    num += 1;

    this.actionActivityMap[action] = num;

    if (num == 1) {
      this.actionUpdateStart(action);
    }

    if (inputType != this.inputActiveLast) {
      this.inputTypeChanged(inputType);
    }
  }

  actionDecrement(action) {
    let num = this.actionActivityMap[action];

    if (isNotNumber(num)) {
      console.warn('Input Manager: Could not decrement action - action number is invalid');
      return;
    }

    num -= 1;

    if (num < 0) {
      console.warn('Input Manager: Action was decremented below 0. Something is wrong.')
    }

    this.actionActivityMap[action] = num;

    if (num == 0) {
      this.actionUpdateStop(action);
    }
  }

  _onKeyPressed(key) {
    const actions = this.keyToActionMap[key];
    if (!actions) {
      return;
    }

    for (const action of actions) {
      if (isString(action)) {
        this.actionIncrement(action);
      }
    }
  }

  _onKeyReleased(key) {
    const actions = this.keyToActionMap[key];
    if (!actions) {
      return;
    }

    for (const action of actions) {
      if (isString(action)) {
        this.actionDecrement(action);
      }
    }
  }

  _setKeyActive(key, isActive) {
    this.keyActivityMap[key] = isActive;
  }

  _isKeyActive(key) {
    return !!this.keyActivityMap[key];
  }

  _addMouseListener() {
    const removeWheel = addEventListener(window, 'wheel', (event) => {
      let key = '';
      if (this.preventDefault) {
        event.preventDefault();
      }

      if (event.wheelDeltaY > 0) {
        key = key + 'wheelup';
      } else if (event.wheelDeltaY < 0) {
        key = key + 'wheeldown';
      } else if (event.wheelDeltaX > 0) {
        key = key + 'wheelright';
      } else if (event.wheelDeltaX < 0) {
        key = key + 'wheelleft';
      } else {
        return;
      }

      const actions = this._findActions('k', key);

      if (actions) {
        this.callActions(actions, 'keyboard', Math.abs(event.wheelDelta));
      }
    }, { passive: false });

    return () => {
      removeWheel();
    }
  }

  _findActions(inputKey, actionKey) {
    inputKey = inputKey + ':';
    let actions;

    if (this.isCtrl) {
      actions = this.keyToActionMap[inputKey + 'ctrl+' + actionKey];
      if (actions && actions.length) {
        return actions;
      }
    }

    actions = this.keyToActionMap[inputKey + actionKey];
    if (actions && actions.length) {
      return actions;
    }

    return false;
  }

  _getKey(event, prefix) {
    let key = prefix + ':';

    if (event.key == '+') {
      key = key + 'plus';
    } else {
      key = key + event.key.toLowerCase();
    }

    return key;
  }

  _addKeyboardListener() {
    const removeKeyDown = addEventListener(window, 'keydown', (event) => {
      if (event.repeat) {
        return;
      }
      if (this.preventDefault) {
        event.preventDefault();
      }

      const key = this._getKey(event, 'k');

      if (event.key == 'Control') {
        this.isCtrl = true;
      }

      window.addEventListener('blur', () => {
        this.isCtrl = false;
      }, {
        once: true,
      });

      if (this._isKeyActive(key)) {
        this._onKeyReleased(key);
      }
      this._setKeyActive(key, true);

      this._onKeyPressed(key);
    });

    const removeKeyUp = addEventListener(window, 'keyup', (event) => {
      if (event.repeat) {
        return;
      }
      if (this.preventDefault) {
        event.preventDefault();
      }

      if (event.key == 'Control' && !event.ctrlKey) {
        this.isCtrl = false;
      }

      const key = this._getKey(event, 'k');
      this._onKeyReleased(key);
      this._setKeyActive(key, false);
    });

    return () => {
      removeKeyDown();
      removeKeyUp();
    };
  }
}
