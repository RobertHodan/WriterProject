import { applyRequisites, isNotComponent } from './utils.mjs';
import { noop } from '../utils/utils.mjs';

/**
 * @typedef {Object} selectable
 * @property {Function} select
 * @property {Function} onSelect // Boolean parameter, isSelected
 */
const requisites = {
  setSelect: function (isSelected) {
    if (isSelected === undefined) {
      isSelected = !this.select.classList.contains('selected');
    }

    if (isSelected === this.isSelected()) {
      return;
    }

    if (isSelected) {
      this.classList.add('selected');
    } else {
      this.classList.remove('selected');
    }

    this.onSelect(isSelected);
  },
  select: function () {
    this.setSelect(true);
  },
  deselect: function () {
    this.setSelect(false);
  },
  onSelect: noop,
  isSelected: function () {
    return this.classList.contains('selected');
  }
}

/**
 *
 * @param {Component} component
 * @param {*} settings
 */
export function selectable(component, settings) {
  settings = { ...requisites, ...settings };

  if (component.isSelectable) {
    return;
  }

  component.isSelectable = true;

  applyRequisites(component, requisites, settings, 'selectable');
}

/**
 *
 * @param {Component | HTMLElement} component
 */
export function isSelectable(component) {
  if (isNotComponent(component)) {
    return false;
  }

  return component.isSelectable;
}
