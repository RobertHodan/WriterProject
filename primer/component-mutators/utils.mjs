import { deepClone, isFunction, noop } from "../utils/utils.mjs";

export function applyRequisites(component, requisites, overrides) {
  const keys = Object.keys(requisites);

  for (const key of keys) {
    const requisite = component[key];
    const hasRequisite = requisite != undefined;

    let setting = requisites[key];
    if (overrides && overrides[key]) {
      setting = overrides[key];
    }
    const isFunc = isFunction(setting);
    if (!hasRequisite) {
      if (isFunc) {
        component[key] = setting.bind(component);
        continue;
      }
    }

    if (isFunc) {
      if (setting !== noop) {
        if (!component[`_${key}`]) {
          component[`_${key}`] = setting.bind(component);
        }
      }
      continue;
    }
  }
}

export function addMutator(component, internals, requisites, overrides) {
  const newInternals = deepClone(internals);
  component[internals.id] = newInternals;
  component.mutators.push(newInternals);

  const internalKeys = Object.keys(internals);
  if (overrides) {
    for (const key of internalKeys) {
      const override = overrides[key];
      if (override) {
        newInternals[key] = override;
      }
    }
  }

  applyRequisites(component, requisites, overrides);
}

/**
 * Returns true if the parameter is a Component object
 * 
 * If the parameter is an element with a Component reference,
 * it will return false.
 * 
 * @param {Component | HTMLElement} component
 */
export function isComponent(component) {
  if (!component) {
    return false;
  }

  return component.isComponent;
}

export function isNotComponent(component) {
  return !isComponent(component);
}
