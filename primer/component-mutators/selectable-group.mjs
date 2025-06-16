import { addEventListener, isInteger, noop } from '../utils/utils.mjs';
import { addMutator, applyRequisites } from './utils.mjs';
import { isSelectable } from './selectable.mjs';

/**
 * @typedef {Object} SelectableGroup
 * @property {Function?} select
 * @property {Function?} selectNext
 * @property {Function?} selectPrev
 * @property {Function?} onSelect
 * @property {boolean?} wrapAround
 * @property {Function?} canSelect
 */

const requisites = {
  selectChild: function (child, skipCallback) {
    if (!this.canSelect()) {
      return false;
    }

    if (isInteger(child)) {
      child = this.getChild(child, this.selectableGroup.wrapAround);
    }

    if (!skipCallback) {
      this.onSelect(child);
    }

    this._deselectPreviousChild();

    if (!child) {
      return false;
    }

    if (isSelectable(child)) {
      child.select();
    } else {
      child.classList.add('selected');
    }

    this._deselectPreviousChild = () => {
      if (isSelectable(child)) {
        child.deselect();
      } else {
        child.classList.remove('selected');
      }

      this._deselectPreviousChild = noop;
    }

    return true;
  },
  getSelectedChild: function () {
    let items = this.getChildren();
    let child;
    for (const item of items) {
      if (item.classList.contains('selected')) {
        child = item;
        break;
      }
    }

    if (!child) {
      child = items[0];
    }

    return child;
  },
  selectNextChild: function () {
    const selectedChild = this.getSelectedChild();
    const index = this.getChildIndex(selectedChild);
    const nextChild = this.getChild(index + 1, this.selectableGroup.wrapAround);
    this.selectChild(nextChild);
  },
  selectPrevChild: function () {
    const selectedChild = this.getSelectedChild();
    const index = this.getChildIndex(selectedChild);
    const nextChild = this.getChild(index - 1, this.selectableGroup.wrapAround);
    this.selectChild(nextChild);
  },
  hoverChild: function (child) {
    if (!this.canSelect()) {
      return false;
    }

    this._unhoverPreviousChild();

    if (!child) {
      return false;
    }

    child.classList.add('hover');

    this._unhoverPreviousChild = () => {
      child.classList.remove('hover');
    }

    return true;
  },
  hoverNextChild: function () {
    const index = this.getHoveredIndex();
    const hoverChild = this.getChild(index + 1, this.selectableGroup.wrapAround);
    this.hoverChild(hoverChild);
  },
  hoverPrevChild: function () {
    const index = this.getHoveredIndex();
    const hoverChild = this.getChild(index - 1, this.selectableGroup.wrapAround);
    this.hoverChild(hoverChild);
  },
  getHoveredChild: function () {
    let items = this.getChildren();
    let hoveredItem;
    for (const item of items) {
      if (item.classList.contains('hover')) {
        hoveredItem = item;
        break;
      }
    }

    return hoveredItem;
  },
  getHoveredIndex: function () {
    const hoveredChild = this.getHoveredChild();
    let index = this.getChildIndex(hoveredChild);
    if (index < 0) {
      index = this.getSelectedIndex();
    }

    if (index < 0) {
      index = 0;
    }

    return index;
  },
  getSelectedIndex: function () {
    const selectedChild = this.getSelectedChild();
    return this.getChildIndex(selectedChild);
  },
  onSelect: noop,
  _deselectPreviousChild: noop,
  _unhoverPreviousChild: noop,
  canSelect: function () { return true },
}

const internals = {
  id: 'selectableGroup',
  wrapAround: false,
  onHoverClassName: false,
}

/**
 *
 * @param {Component} component
 * @param {SelectableGroup} settings
 */
export function selectableGroup(component, settings) {
  if (component.isSelectableGroup) {
    return;
  }

  component.isSelectableGroup = true;

  addMutator(component, internals, requisites, settings);

  if (component.selectableGroup.onHoverClassName) {
    const el = component.getElement();
    const removers = [];
    el.addEventListener('mouseenter', () => {
      const items = component.getItems();
      for (const item of items) {
        const remover = addEventListener(item, 'mouseenter', () => {
          this.hoverChild(item);
        });
        removers.push(remover);
      }
    });

    el.addEventListener('mouseleave', () => {
      for (const remover of removers) {
        remover();
      }
    });
  }
}
