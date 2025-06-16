import { Button } from '../../primer/components/button.mjs';
import { Component } from '../../primer/components/component.mjs';
import { isArray, isFunction, isTrueFalse, isValid } from '../../primer/utils/utils.mjs';
import { createDynamicIcon } from '../dynamic-icon.mjs';
import { createLanguageLabel, isLanguageLabelCompatible } from '../language-label.mjs';

/**
 * @typedef {Object} ComponentParams
 * @property {Function?} action
 * @property {boolean?} keyboardFocusable
 * @property {Array<Item>} items
 */

/**
 * @typedef {Object} Item
 * @property {string} navAction
 * @property {string} label
 * @property {Function} action
 */

const defaults = {
  className: 'action-bar',
  items: [],
  keyboardFocusable: undefined,
  btnClassName: undefined,
  createItemElement: undefined,
}

export class ActionBar extends Component {
  /**
   *
   * @param {ComponentParams} settings
   */
  constructor(settings) {
    settings = {...defaults, ...settings};
    super(settings);

    this.keyboardFocusable = settings.keyboardFocusable;
    this.btnClassName = settings.btnClassName;
    
    this.createItemElement = (btnSettings) => {
      return new Button(btnSettings);
    }
    if (isFunction(settings.createItemElement)) {
      this.createItemElement = settings.createItemElement;
    }

    if (settings.items) {
      this.setItems(settings.items);
    }
  }

  setItems(items) {
    for (const item of items) {
      const label = this._createLabel(item.label);

      const btnSettings = this._getBtnSettings(item);

      let length = 1;
      if (isArray(btnSettings.navAction)) {
        length = btnSettings.navAction.length;
      }
      
      let container;
      if (length != 1) {
        container = item.contentContainer || document.createElement('div');
      }

      const navActions = btnSettings.navAction;
      const button = this.createItemElement(btnSettings);

      for (let i = 0; i < length; i++) {
        btnSettings.navAction = isArray(navActions) ? navActions[i] : navActions;

        button.append(label);
        // if (length == 1) {
        //   container = button;
        // } else {
        //   container.append(button);
        // }
      }

      // if (length == 1) {
      //   container = button;
      // }

      // if (length != 1) {
      //   container.append(label);
      // }

      this.append(button);
    }
  }

  _getBtnSettings(item) {
    let keyboardFocusable = item.keyboardFocusable;
    if (isTrueFalse(this.keyboardFocusable)) {
      keyboardFocusable = this.keyboardFocusable;
    }
    const btnSettings = {
      ...item,
    };

    if (isTrueFalse(keyboardFocusable)) {
      btnSettings.keyboardFocusable = keyboardFocusable;
    }

    const classNames = [];
    if (isValid(this.btnClassName)) {
      if (isArray(this.btnClassName)) {
        classNames.push(...this.btnClassName);
      } else {
        classNames.push(this.btnClassName);
      }
    }

    if (isValid(item.className)) {
      if (isArray(item.className)) {
        classNames.push(...item.className);
      } else {
        classNames.push(item.className);
      }
    }
    btnSettings.className = classNames;

    return btnSettings;
  }

  _createLabel(label) {
    if (isLanguageLabelCompatible(label)) {
      return createLanguageLabel(label);
    }

    return new Component({content: label});
  }
}
