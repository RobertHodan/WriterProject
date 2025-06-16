/**
 * @typedef {Object} SearchableItemSettings
 * @property {string | HTMLElement} content
 * @property {string} id;
 * @property {string[]?} searchableTags;
 * @property {string?} searchableCategory;
 * @property {string?} contextId;
 * @property {string?} tagName
 * @property {string?} className
 */

import { Component } from '../components/component.mjs';
import { clearElement, noop } from '../utils/utils.mjs';

const defaults = {
}

/**
 *
 * @returns {SearchableItemBank}
 */
export function getSearchableItemBank() {
  let ItemBank = window.SearchableItemBank;
  if (ItemBank) {
    return ItemBank;
  }

  ItemBank = new SearchableItemBank();
  window.SearchableItemBank = ItemBank;

  return ItemBank;
}

function searchable(component, settings) {
  component.searchable = settings;
}

export class SearchableItemBank {
  constructor(settings) {
    settings = {...defaults, ...settings};

    /**
     * 'default': {
     *    'item-id': SearchableItem,
     * }
     */
    this.contextMap = {};

    /**
     * 'category-id': SearchableItem[]
     */
    this.categoryMap = {};
  }

  /**
   *
   * @param {Component | Element} item
   * @param {*} settings
   */
  addItem(item, settings) {
    const id = settings.id;
    const hasValidId = id && id.length && id.length > 0;
    if (!hasValidId) {
      return;
    }

    searchable(item, settings);
    const contextId = settings.contextId || 'default';

    this.setItem(item, contextId);

    return item;
  }

  getItems(contextId = 'default') {
    return this.contextMap[contextId];
  }

  getItem(id, contextId = 'default') {
    const itemMap = this.contextMap[contextId];
    if (!itemMap) {
      return;
    }

    return itemMap[id];
  }

  /**
   *
   * @param {SearchableItemSettings} settings
   */
  // getOrCreateItem(settings) {
  //   const id = settings.id;
  //   const hasValidId = id && id.length && id.length > 0;
  //   if (!hasValidId) {
  //     return;
  //   }

  //   const item = new Component(settings);
  //   const contextId = settings.contextId || 'default';

  //   this.setItem(item, contextId);

  //   return item;
  // }

  findItemsByCategory(category) {
    if (!this.categoryMap[category]) {
      return [];
    }

    return this.categoryMap[category];
  }

  setItem(item, contextId) {
    const search = item.searchable;
    let itemMap = this.contextMap[contextId];
    if (!itemMap) {
      itemMap = {};
      this.contextMap[contextId] = itemMap;
    }

    itemMap[search.id] = item;

    // Category
    if (search.searchableCategory) {
      this._setItemCategory(item);
    }
  }

  _setItemCategory(item) {
    const search = item.searchable;
    if (!this.categoryMap[search.searchableCategory]) {
      this.categoryMap[search.searchableCategory] = [];
    }

    const items = this.categoryMap[search.searchableCategory];
    items.push(item);
  }
}
