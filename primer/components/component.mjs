/**
 * @typedef {Object} ComponentParams
 * @property {string | HTMLElement} content
 * @property {string?} tagName
 * @property {string?} className
 */

import { ObserverSingleton } from '../../nav-ui/observer-singleton.mjs';
import { clamp, clearElement, isArray, isFunction, isIterable, isString, noop } from '../utils/utils.mjs';

const defaults = {
}

export class Component extends HTMLElement {
  /**
  *
  * @param {ComponentParams} settings
  */
  constructor(settings) {
    super(settings);

    settings = { ...defaults, ...settings };
    this.settings = settings;
    this.onRemoved = noop;

    // Ideally, this ID should be used as a quick way to check if child components belong to a parent.
    this.sharedId = '';
    this.onDestroyCallbacks = [];
    this.eventRemovers = [];
    this.eventInstantiators = [];
    this.mutators = [];

    this.isComponent = true;
    this.isinitialized = false;

    // Components need to know when they have been added / removed from the DOM
    // An observer is used to achieve this. This code block executes only once.
    if (!Component._observer) {
      Component._observer = new ObserverSingleton();

      Component._observer.observeBooleanTrue('isComponent', function(component) {
        if (isFunction(component.onAddedToDOM)) {
          component.onAddedToDOM();
        }

        return function() {
          if (isFunction(component.onRemovedFromDOM)) {
            component.onRemovedFromDOM();
          }
        }
      });
    }
  }

  append(child) {
    this._addChild(child, true);
  }

  prepend(child) {
    this._addChild(child, false);
  }

  _addChild(child, isAppend) {
    if (child == undefined) {
      return;
    }

    if (isIterable(child)) {
      for (const c of child) {
        isAppend ? this.append(c) : this.prepend(c);
      }
      return;
    }

    isAppend ? super.append(child) : super.prepend(child);

    if (isFunction(child.onAddedToDOM)) {
      child.onAddedToDOM();
    }
  }

  // Should be used to update any elements when data changes
  // By default, will trigger on "onRender"
  update() {

  }

  initialize() {
    this.isinitialized = true;
  }

  onAddedToDOM() {
    // Assume that the next frame renders the element
    setTimeout(() => {
      this.onRender();
    }, 0);

    if (!this.isinitialized) {
      this.initialize();
    }

    const children = this.getChildren();
    for (let child of children) {
      if (isFunction(child.onAddedToDOM)) {
        child.onAddedToDOM();
      }
    }
  }

  onRender() {
    this.update();
  }

  setContent(content) {
    this.removeChildren();

    this.append(content);
  }

  getChildIndex(element) {
    const children = this.getChildren();

    return children.indexOf(element);
  }

  getChildren() {
    return Array.from(this.children);
  }

  getChild(index, wrapAround = false) {
    const children = this.getChildren();
    const maxIndex = children.length - 1;

    let wrapNum = 0;
    const isLesser = index < 0;
    const isGreater = index > maxIndex;
    if (isGreater) {
      wrapNum = index - maxIndex;
    }
    if (isLesser) {
      wrapNum = Math.abs(index);
    }

    if (wrapAround && wrapNum) {
      if (isLesser) {
        index = maxIndex - wrapNum + 1;
      } else {
        index = wrapNum - 1;
      }
    } else {
      index = clamp(index, 0, maxIndex);
    }

    return children[index];
  }

  addEventListener(scope = this, event = '', callback = () => { }) {
    if (typeof (scope) == 'string') {
      callback = event;
      event = scope;
      scope = this;
    }

    const data = {
      remover: noop,
    };
    const instantiator = () => {
      if (scope == this) {
        super.addEventListener(event, callback);
      } else {
        scope.addEventListener(event, callback);
      }

      data.remover = () => {
        if (scope == this) {
          super.removeEventListener(event, callback);
        } else {
          scope.removeEventListener(event, callback);
        }
      }
    };
    instantiator();

    const removeEvent = function() {
      data.remover();
      data.remover = noop;
    }
    this.eventRemovers.push(removeEvent);
    this.eventInstantiators.push(instantiator);

    return removeEvent;
  }

  enableEvents() {
    for (const instantiator of this.eventInstantiators) {
      instantiator();
    }
  }

  disableEvents() {
    for (const remove of this.eventRemovers) {
      remove();
    }
  }

  clearEvents() {
    while (this.eventRemovers.length > 0) {
      const remover = this.eventRemovers[0];
      remover();
      this.eventRemovers.splice(0, 1);
    }
  }

  removeChildren() {
    clearElement(this);
  }

  isHidden() {
    return this.clientHeight == 0 &&
      this.clientWidth == 0;
  }

  isVisible() {
    return !this.isHidden();
  }

  destroy() {
    this.onDestroy();
  }

  onDestroy() {
    while (this.onDestroyCallbacks.length > 0) {
      const destroyer = this.onDestroyCallbacks[0];
      destroyer();
      this.onDestroyCallbacks.splice(0, 1);
    }

    this.remove();
    this.clearEvents();
    delete this.eventRemovers;
    delete this.eventInstantiators;
    this.eventRemovers = [];
    this.eventInstantiators = [];
  }

  cloneNode(deep) {
    const clone = super.cloneNode(deep);
    clone.isClone = true;
    this.onCloned(clone);
    return clone;
  }

  onCloned(clone) {

  }
}

customElements.define('component-base', Component);
