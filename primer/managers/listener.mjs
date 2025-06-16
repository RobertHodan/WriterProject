import { getCallbackBank } from "./callback-bank.mjs";

const defaults = {
}

export class Listener {
  constructor(settings) {
    settings = {...defaults, ...settings};

    this.actionToCallbackMap = {};
    this.removerMap = {};
    this.removerIdLast = 0;
    this.callbackBank = getCallbackBank();
    this.tag = `${settings.tag} (Listener Object)` || 'Listener Object';
  }

  setCallback(action, callback) {
    if (!callback) {
        callback = action;
        action = 'default';
    }

    const data = this.callbackBank.addCallback(
      callback,
      () => {
        const cbs = this._getCallbacks(action);

        const index = cbs.indexOf(data);
        if (index >= 0) {
          cbs.splice(index, 1);
        }
      },
      this.tag,
    );
    const callbacks = this._getCallbacks(action);
    callbacks.push(data);
  }

  clear(action = 'default') {
    const callbacks = this.actionToCallbackMap[action];

    for (const data of callbacks) {
      data.remover();
    }
  }

  clearAll() {
    const actions = Object.keys(this.actionToCallbackMap);
    for (const action of actions) {
      const callbacks = this.actionToCallbackMap[action];

      for (const data of callbacks) {
        data.remover();
      }
    }
  }

  call() {
    this.callAction('default', arguments);
  }

  callAction() {
    const [action, ...args] = arguments;
    const callbacks = this._getCallbacks(action);

    for (const data of callbacks) {
      data.callback(...args);
    }
  }

  /**
   * 
   * @param {string} action 
   * @returns {Array}
   */
  _getCallbacks(action) {
    if (!this.actionToCallbackMap[action]) {
      this.actionToCallbackMap[action] = [];
    }

    return this.actionToCallbackMap[action];
  }
}
