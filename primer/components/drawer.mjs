/**
 * @typedef {Object} DrawerParams
 * @property {Array<string | HTMLElement>} items
 */

import { Enum, clearElement, noop, wrapAround } from '../utils/utils.mjs';
import { Component } from './component.mjs';
import { Button } from './button.mjs';

const defaults = {
  label: undefined,
  onShow: noop,
  onHide: noop,
  shouldPrependContent: false,
}

export const DRAWERLABELTYPE = Enum([
  "ALL",
  "OPEN",
  "CLOSE"
]);

export class Drawer extends Component {
  /**
  *
  * @param {DrawerParams} settings
  */
  constructor(settings) {
    settings = {...defaults, ...settings};

    super(settings);
    this.el.classList.add('drawer');

    this.onHide = settings.onHide;
    this.onShow = settings.onShow;
    this.isContentPrepended = settings.shouldPrependContent;

    this.labelContainer = new Button({
      className: 'drawer-label',
      keyboardFocusable: false,
      action: () => this.action()
    });
    this.labelSwapper = new Component({ className: 'swapper'});
    this.labelContainer.append(this.labelSwapper);
    this.el.append(this.labelContainer.el);

    this.drawerContent = new Component({
      className: 'drawer-content',
    });

    if (settings.label) {
      this.labelContainer.append(settings.label);
    }

    this.labelWhenOpen;
    this.labelWhenClosed;
    this.isLabelTypeAll = true;
  }

  getChildElements() {
    return this.drawerContent.el.children;
  }

  setLabel(label, labelType = DRAWERLABELTYPE.ALL) {
    if (labelType === DRAWERLABELTYPE.ALL) {
      this.isLabelTypeAll = true;
      this.labelWhenOpen = label;
      this._updateLabel();
      return;
    }

    this.isLabelTypeAll = false;
    if (labelType === DRAWERLABELTYPE.OPEN) {
      this.labelWhenOpen = label;
    } else {
      this.labelWhenClosed = label;
    }

    this._updateLabel();
  }

  _updateLabel() {
    let label;
    if (this.isLabelTypeAll) {
      label = this.labelWhenOpen;
    } else {
      label = this.isOpen() ? this.labelWhenOpen : this.labelWhenClosed;
    }

    this.labelSwapper.removeChildren();

    this.labelSwapper.append(label);
  }

  setContent(content) {
    this.drawerContent.removeChildren();
    this.drawerContent.append(content);
  }

  action() {
    this.isVisible() ? this.hide() : this.show();
  }

  removeChildren() {
    this.drawerContent.removeChildren();
  }

  append(item) {
    this.drawerContent.append(item);
  }

  show() {
    if (this.isVisible()) {
      return;
    }

    if (this.isContentPrepended) {
      this.el.prepend(this.drawerContent.el);
    } else {
      this.el.append(this.drawerContent.el);
    }
    this.el.classList.add('open');
    this._updateLabel();

    this.onShow();
  }

  hide() {
    if (!this.isVisible()) {
      return;
    }

    this.drawerContent.remove();
    this.el.classList.remove('open');
    this._updateLabel();

    this.onHide();
  }

  isOpen() {
    return this.isVisible();
  }

  isVisible() {
    return this.el.classList.contains('open');
  }
}
