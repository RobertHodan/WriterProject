import { isNotValid, noop } from '../utils/utils.mjs';
import { Component } from '../components/component.mjs';

/**
 * @typedef {Object} ComponentParams
 * @property {Function?} action
 * @property {boolean?} keyboardFocusable
 * @property {Array<Array<TemplateObject>} template
 */

/**
 * @typedef {Object} TemplateObject
 * @property {HTMLElement} content
 * @property {string} action
 */

const defaults = {
  action: noop,
  onValueUpdated: noop,
  onShow: noop,
  onHide: noop,
  keyboardFocusable: true,
  footer: undefined,
  header: undefined,
}

export class PageManager extends Component {
  /**
   *
   * @param {ComponentParams} settings
   */
  constructor(settings) {
    settings = {...defaults, ...settings};
    super(settings);

    this.pages = {};
    this.classNamesBase = {};

    this.currentPage;
    this.el.classList.add('page-container');

    this._hidePrevPage = noop;
  }

  /**
   *
   * @param {string} id
   * @param {Component | Element} component
   */
  addPage(id, component, settings) {
    if (isNotValid(component)) {
      return;
    }
    const {classNamePage} = settings;

    this.pages[id] = component;

    if (classNamePage) {
      this.classNamesBase[id] = classNamePage;
    }

    if (isNotValid(this.currentPage)) {
      this.showPage(id);
    }
  }

  showPage(id) {
    this._hidePrevPage();

    const page = this.pages[id];
    this.currentPage = page;

    const classNameBase = this.classNamesBase[id];
    if (classNameBase) {
      this.el.classList.add(classNameBase);
    }

    this.append(page);

    this._hidePrevPage = () => {
      page.remove();
      if (classNameBase) {
        this.el.classList.remove(classNameBase);
      }
    };
  }
}
