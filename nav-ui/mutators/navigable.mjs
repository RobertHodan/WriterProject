import { addMutator, applyRequisites } from "../../primer/component-mutators/utils.mjs";

const requisites = {
  canNavigate: function () {
    return true;
  },
}

const internals = {
  id: 'navigable',
  isContextActive: false,
  context: undefined,
  bindings: undefined,
  contextBindings: undefined,
}

/**
 *
 * @param {Component} component
 */
export function navigable(component, params) {
  component.classList.add('nui-navigable');

  addMutator(component, internals, requisites, params);

  if (params.bindings) {
    connectBindings(component, params.bindings);
  }

  if (params.contextBindings) {
    connectBindings(component, params.contextBindings, true);
  }
}

function connectBindings(component, paramBindings, isContext) {
  let bindings = {};
  const keys = Object.keys(paramBindings);
  if (typeof (keys[0]) === 'string' && typeof (paramBindings[keys[0]]) === 'function') {
    return;
  }

  if (!isContext) {
    component.navigable.bindings = bindings;
  } else {
    component.navigable.contextBindings = bindings;
  }

  for (const key of keys) {
    const func = findFunction(component, key);
    if (typeof (func) === 'function') {
      const performAction = function (strength) {
        if (component.canNavigate()) {
          func.call(component, strength);
        }
      };

      let actionKeys = paramBindings[key];
      if (!Array.isArray(actionKeys)) {
        actionKeys = [actionKeys];
      }
      for (const actionKey of actionKeys) {
        bindings[actionKey] = performAction;
      }
    }
  }
}

function findFunction(component, functionName) {
  // let func = component.actions && component.actions[functionName];

  // if (!func) {
  //   func = component[functionName];
  // }

  let func = component[functionName];

  return func;
}
