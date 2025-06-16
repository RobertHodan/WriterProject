/**
 * @typedef {Object} DropdownParams
 * @property {Array<string | HTMLElement>} items
 * @property {number | string | HTMLElement} selectedItem
 */

 import { clearElement, noop, wrapAround } from '../utils/utils.mjs';
 import { Component } from './component.mjs';
 import { selectableGroup } from '../component-mutators/selectable-group.mjs';
import { selectable } from '../component-mutators/selectable.mjs';
import { actionable } from '../component-mutators/actionable.mjs';

 const defaults = {
   items: [],
   selectedIndex: 0,
   hideDropdownOnClickOut: true,
   onShow: noop,
   onHide: noop,
   onSelect: noop,
 }

export class Dropdown extends Component {
  /**
  *
  * @param {DropdownParams} settings
  */
  constructor(settings) {
    settings = {...defaults, ...settings};

    super(settings);
    this.el.classList.add('dropdown');

    this.onHide = settings.onHide;
    this.onShow = settings.onShow;

    selectableGroup(this, {
      onSelect: settings.onSelect,
    });

    this.items = [];
    this.index = settings.selectedIndex;
    this._restoreItemContent = noop;

    this.selectedContainer = new Component({
      className: 'selected-item',
    });
    actionable(this.selectedContainer, {
      action: () => this.action()
    })
    this.el.append(this.selectedContainer.el);

    this.list = new Component({
      className: 'dropdown-list',
    });
    actionable(this.list, {
      action: () => {
        this.select(this.list.index);
      }
    })
    selectableGroup(this.list, {
      wrapAround: true,
      selectOnHover: true,
    });

    for (const item of this.items) {
      this.append(item);
    }

    if (settings.items) {
      for (const item of settings.items) {
        this.append(item);
      }

      this.select(settings.selectedItem || 0);
    }
  }

  getItems() {
    return this.items;
  }

  getListComponent() {
    return this.list;
  }

  action() {
    this.isVisible() ? this.hide() : this.show();
  }

  getSelectedIndex() {
    return this.index;
  }

  getSelectedItem() {
    return this.items[this.index];
  }

  removeChildren() {
    this.items = [];
    this.list.removeChildren();
    this.selectedContainer.removeChildren();
  }

  append(item) {
    const itemContainer = new Component();
    selectable(itemContainer);
    actionable(itemContainer, {
      action: () => {
        this.select(itemContainer);
      },
    });

    itemContainer.append(item);
    itemContainer.content = item;

    this.items.push(itemContainer);
    this.list.append(itemContainer);

    if (this.items.length === 1) {
      this.select(0);
    }
  }

  setSelectedContent(content) {
    this.selectedContainer.setContent(content);
  }

  show() {
    if (this.isVisible()) {
      return;
    }

    const content = this._restoreItemContent();
    const clone = content.cloneNode(true);

    this.setSelectedContent(clone);
    this.el.append(this.list.getElement());

    this.el.classList.add('open');

    this.onShow();
  }

  hide() {
    if (!this.isVisible()) {
      return;
    }

    this.list.remove();
    this.el.classList.remove('open');
    const selected = this.selectedContainer.getElement();

    if (selected.firstChild.isClone) {
      this.select(this.index);
    }

    this.onHide();
  }

  isVisible() {
    return this.el.classList.contains('open');
  }

  select(index) {
    const newSelection = this._select(index);
    if (!newSelection) {
      return;
    }

    const item = this.items[this.index];
    this._restoreItemContent();
    const content = this._popItemContent(item);
    this.setSelectedContent(content);

    this.hide();
  }

  _popItemContent(item) {
    const content = item.content;
    content.remove();

    this._restoreItemContent = () => {
      item.append(content);
      this._restoreItemContent = noop;

      return content;
    };

    return content;
  }
}
