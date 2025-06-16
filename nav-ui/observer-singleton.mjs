// Singleton
// https://stackoverflow.com/a/59646297

import { isArray, isIterable, isNotValid, isString, isValid } from "../primer/utils/utils.mjs";

export class ObserverSingleton {
  constructor() {
    if (ObserverSingleton._instance) {
      return ObserverSingleton._instance
    }
    ObserverSingleton._instance = this;

    this.connectableClassNames = [];
    this.connectableVariableNames = [];
    this.classNameConnectorMap = {};
    this.variableConnectorMap = {};
    this.connectedChildren = [];
    this.disconnectors = [];

    setTimeout(() => {
      this._beginObserving(document.body);
    }, 0);
  }

  /**
   * @description Calls the connector function onto elements that share the classname automatically
   * @param {string} className
   * @param {function} connector
   */
  observeClassName(className, connector) {
    if (!this.connectableClassNames.includes(className)) {
      this.connectableClassNames.push(className);
    }

    let connectors = this.classNameConnectorMap[className] || [];
    connectors.push(connector);
    this.classNameConnectorMap[className] = connectors;

    const {
      classElements
    } = this._findElements(document.body, undefined, className);
    for (const child of classElements) {
      this._connectChildClass(child);
    }
  }

  // This should only run once (per unique variableName) in the lifetime of the application
  observeBooleanTrue(variableName, connector) {
    if (!this.connectableVariableNames.includes(variableName)) {
      this.connectableVariableNames.push(variableName);
    }

    let connectors = this.variableConnectorMap[variableName] || new Set();
    connectors.add(connector);
    this.variableConnectorMap[variableName] = connectors;

    // Connect any existing elements
    const {
      variableElements,
    } = this._findElements(document.body, variableName);

    for (const child of variableElements) {
      this._connectChildVariable(child);
    }
  }

  _beginObserving(parent) {
    const {
      variableElements,
      classElements,
    } = this._findElements(parent, this.connectableVariableNames, this.connectableClassNames);

    let parentComponents = [];
    for (const child of classElements) {
      parentComponents.push(child);
      this._connectChildClass(child);
    }

    for (const child of variableElements) {
      parentComponents.push(child);
      this._connectChildVariable(child);
    }

    const observer = new MutationObserver((mutations) => {
      let addedChildren = [];
      let removedChildren = [];
      for (const mutation of mutations) {
        const added = mutation.addedNodes;
        const removed = mutation.removedNodes;

        if (removed.length) {
          for (const el of removed) {
            const r = this._getConnectableChildren(el);
            removedChildren.push(r);
          }
        }

        if (added.length) {
          for (const el of added) {
            addedChildren.push(...this._getConnectableChildren(el));
          }
        }
      }

      // Remove duplicates
      addedChildren = [... new Set([].concat(...addedChildren))];
      removedChildren = [... new Set([].concat(...removedChildren))];

      for (const child of removedChildren) {
        const index = parentComponents.indexOf(child);
        parentComponents.splice(index, 1);
        child.disconnectFromObservable();
      }

      for (const child of addedChildren) {
        parentComponents.push(child);
        this._connectChildClass(child);
      }
    });

    observer.observe(parent, { childList: true, subtree: true });

    return () => {
      observer.disconnect();

      for (const component of parentComponents) {
        component.disconnectNav();
      }

      parentComponents = [];
    }
  }

  _connectChildClass(component) {
    if (!component) {
      return;
    }
    const disconnectors = [];
    const connectors = this._getConnectors(component);

    for (const connector of connectors) {
      const remover = connector(component);
      disconnectors.push(remover);
    }

    this.connectedChildren.push(component);

    component.disconnectFromObservable = () => {
      for (const disconnect of disconnectors) {
        disconnect();
      }

      const index = this.connectedChildren.indexOf(component);
      this.connectedChildren.splice(index, 1);
    }
  }

  _connectChildVariable(component) {
    if (!component) {
      return;
    }
    const disconnectors = [];
    const connectors = this._getConnectorsVariable(component);

    for (const connector of connectors) {
      const disconnect = connector(component);
      disconnectors.push(disconnect);
    }

    this.connectedChildren.push(component);

    component.disconnectFromObservable = () => {
      for (const disconnect of disconnectors) {
        disconnect();
      }

      const index = this.connectedChildren.indexOf(component);
      this.connectedChildren.splice(index, 1);
    }
  }

  _getConnectors(component) {
    const names = this.connectableClassNames;

    let connectors = [];
    for (const name of names) {
      if (component.classList.contains(name)) {
        connectors = connectors.concat(...this.classNameConnectorMap[name] || []);
      }
    }

    // Remove duplicates
    connectors = [... new Set([].concat(...connectors))];

    return connectors;
  }

  _getConnectorsVariable(component) {
    const names = this.connectableVariableNames;

    let connectors = [];
    for (const name of names) {
      if (component[name]) {
        connectors = connectors.concat(...this.variableConnectorMap[name] || []);
      }
    }

    // Remove duplicates
    connectors = [... new Set([].concat(...connectors))];

    return connectors;
  }

  _findElements(parent, variableNames = [], classNames = []) {
    if (isString(variableNames)) {
      variableNames = [variableNames];
    }
    if (isString(classNames)) {
      classNames = [classNames];
    }

    let varLength = variableNames.length;
    let classLength = classNames.length;
    const vElements = new Set();
    const cElements = new Set();
    for (let i = 0; i < Math.max(varLength, classLength); i++) {
      const vName = variableNames[i];
      const cName = classNames[i];

      this._findElementsRecursive(parent, vName, cName, vElements, cElements);
    }

    return {
      variableElements: vElements,
      classElements: cElements,
    };
  }

  _findElementsRecursive(parent, variableName, className, variableElements, classElements) {
    if (!parent) {
      return;
    }

    if (isNotValid(variableElements)) {
      variableElements = [];
    }

    if (isNotValid(classElements)) {
      classElements = [];
    }

    for (const child of parent.children) {
      if (variableName && isValid(child[variableName])) {
        if (variableElements instanceof Array) {
          variableElements.push(child);
        }
        else if (variableElements instanceof Set) {
          variableElements.add(child);
        }
      }

      if (className && child.classList.contains(className)) {
        if (classElements instanceof Array) {
          classElements.push(child);
        }
        else if (classElements instanceof Set) {
          classElements.add(child);
        }
      }

      if (child.children && child.children.length) {
        this._findElementsRecursive(child, variableName, className, variableElements, classElements);
      }
    }
  }

  _getConnectableChildren(parent, className) {
    let query = '';

    const names = className ? [className] : this.connectableClassNames;
    for (const name of names) {
      query += `.${name}`;

      if (names[names.length - 1] !== name) {
        query += ',';
      }
    }

    let arr = parent.querySelectorAll ? parent.querySelectorAll(query) : [];
    arr = Array.from(arr);

    if (this._isConnectableClassName(parent)) {
      arr.push(parent);
    }

    return arr;
  }

  _isConnectableClassName(child) {
    if (!child.classList) {
      return false;
    }
    const classNames = this.connectableClassNames;

    for (const name of classNames) {
      if (child.classList.contains(name)) {
        return true;
      }
    }

    return false;
  }
}
