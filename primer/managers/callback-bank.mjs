import { noop } from "../utils/utils.mjs";

export function getCallbackBank() {
    if (window.callbackBank) {
        return window.callbackBank;
    }
    
    window.callbackBank = new CallbackBank();
    return window.callbackBank;
}

/**
 * @typedef {Object} CallbackData
 * @property {function} callback
 * @property {number} id
 * @property {string?} tag
*/

const defaults = {
}

export class CallbackBank {
  constructor(settings) {
    settings = {...defaults, ...settings};

    this.callbackIdPrev = 0;
    this.callbackMap = {};
  }

  addCallback(callback, onRemove, tag) {
    if (!callback) {
        console.warn('CallbackBank: No callback was provided');
        return;
    }

    if (!onRemove) {
        onRemove = noop;
    }

    const data = this._createCallbackData(callback, tag);

    if (this.callbackMap[data.id]) {
        console.warn('CallbackBank: existing callback was overwritten');
    }

    this.callbackMap[data.id] = data;

    data.remover = () => {
        delete this.callbackMap[id];
        onRemove();
        onRemove = noop;
        callbackData.remover = noop;
        callbackData.callback = noop;
    };

    return data;
  }

  /**
   * 
   * @param {funciton} callback
   * @param {string?} tag
   * 
   * @returns {CallbackData}
   */
  _createCallbackData(callback, tag) {
    const data = {};
    data.id = (this.callbackIdPrev += 1);
    data.callback = callback;

    if (tag) {
        data.tag = tag;
    }

    return data;
  }
}
