import { NavRemote } from './nav-remote.mjs';
import { ObserverSingleton } from './observer-singleton.mjs';

/**
 * @typedef {Object} NavActionMap
 * @property {Array<Function>}
 */

let navUISingleton = undefined;
export function getNavUISingleton() {
  if (!navUISingleton) {
    navUISingleton = new NavUI();
  }

  return navUISingleton;
}

export class NavUI {
  constructor() {
    /**
     * @type {nav}
     */
    this.remote = new NavRemote(this);
    this.selectedContext = 'default';
    /**
     * @type {Object}
     * @property {NavActionMap}
     * @description
     *  Specifies the context of events. Only the selected context will have the elements corresponding to it fire.
     *  A 'default' context is always present.
     */
    this.contextMap = {
      'default': {},
    }
    this.connectedChildren = [];

    this.observer = new ObserverSingleton();
    this.observer.observeClassName('nui-navigable', (component) => {
      return this.connectNavigable(component);
    });
  }

  getRemote() {
    return this.remote;
  }

  /**
   *
   * @param {string} action
   * @param {number} strength
   */
  performAction(action, strength) {
    const actionMap = this.getActionMap();

    const callbacks = actionMap[action];
    if (callbacks && callbacks.length) {
      for (const cb of callbacks) {
        cb(strength);
      }
    }
  }

  setContext(context) {
    this.selectedContext = context;
  }

  undoContext() {
    this.setContext('default');
  }

  connectNavigable(component) {
    const removers = [];

    if (this.connectedChildren.includes(component)) {
      // return noop;
    }

    const nav = component.navigable;

    if (nav.bindings) {
      const actionMap = this.getActionMap('default');
      const actionKeys = Object.keys(nav.bindings);
      for (const actionKey of actionKeys) {
        removers.push(this._onAction(actionMap, actionKey, () => {
          nav.bindings[actionKey]();
        }));
      }
    } else if (nav.context && nav.contextBindings) {
      const actionMap = this.getActionMap(nav.context);
      const actionKeys = Object.keys(nav.contextBindings);
      for (const actionKey of actionKeys) {
        removers.push(this._onAction(actionMap, actionKey, (strength) => {
          nav.contextBindings[actionKey](strength);
        }));
      }
    }


    this.connectedChildren.push(component);

    return () => {
      for (const remover of removers) {
        remover();
      }

      this.connectedChildren = this.connectedChildren.splice(this.connectedChildren.indexOf(component), 1);
    }
  }

  getContext() {
    if (!this.contextMap[this.selectedContext]) {
      this.undoContext();
    }

    return this.selectedContext;
  }

  /**
   *
   * @param {string?} context
   */
  getActionMap(context) {
    if (!context) {
      context = this.getContext();
    }

    let actionMap = this.contextMap[context];
    if (!actionMap) {
      return this.contextMap[context] = {};
    }

    return actionMap;
  }

  _onAction(actionMap, action, callback) {
    const cbs = actionMap[action] || [];
    cbs.push(callback);

    actionMap[action] = cbs;

    return () => {
      let cbs = actionMap[action];
      cbs.splice(cbs.indexOf(callback), 1);
      actionMap[action] = cbs;
    }
  }
}
