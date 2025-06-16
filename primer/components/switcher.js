/**
 * @typedef {Object} SwitchParams
 * @property {Array<string | HTMLElement>} items
 * @property {number | string | HTMLElement} selectedItem
 */

import { clearElement, noop } from '../utils/utils.mjs';
import { Component } from './component.mjs';
import { selectableGroup } from '../component-mutators/selectable-group.js';

const defaults = {
  items: [],
  selectedItem: 0,
}

 export class Switcher extends Component {
  /**
   *
   * @param {SwitchParams} settings
   */
  constructor(settings) {
    settings = {...defaults, ...settings};

    super(settings);

    this.items = [];
    selectableGroup(this, settings);

    if (settings.items) {
      this._addItems(settings.items);
    }
    if (settings.content) {
      this.setContent(settings.content);
    }

    if (this.items.length > 0) {
      this.select(settings.selectedItem);
    }
    this.index = settings.selectedItem;
  }

  getItems() {
    return this.items;
  }

  getSelectedIndex() {
    return this.index;
  }

  setContent(content) {
    if (!this.items) {
      return;
    }
    this.removeChildren();

    const children = Array.from(content.children);
    for (const child of children) {
      this.append(child);
    }
  }

  append(item) {
    this.items.push(item);

    if (this.items.length === 1) {
      this.select(0);
    }
  }

  removeChildren() {
    super.removeChildren();

    this.items = [];
  }

  select(index, skipCallback) {
    if (typeof(index) !== 'number') {
      index = this.items.indexOf(index);
    }

    this._select(index, this.items, skipCallback);

    clearElement(this.el);
    const item = this.items[this.index];
    this.el.append(item);
  }

  _addItems(items) {
    for (const item of items) {
      this.items.push(item);
    }
  }
}
