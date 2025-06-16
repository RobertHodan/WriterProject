import { StringController } from '../string-controller.js';
import { noop, wrapAround } from '../utils/utils.mjs';
import { Button } from './button.js';
import { Component } from './component.mjs';
import { numPadNumericSimple } from './virtual-keyboard-templates.js';

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
  onSubmit: noop,
  keyboardFocusable: true,
}

export class VirtualKeyboard extends Component {
  /**
   *
   * @param {ComponentParams} settings
   */
  constructor(settings) {
    settings = { ...defaults, ...settings };
    super(settings);

    let template = settings.template;
    if (!template) {
      template = numPadNumericSimple;
    }

    this.contentValues = [];
    this.setTemplate(template);
    this._deselectPrev = noop;
    this.indexX = 0;
    this.indexY = 0;

    this.onAction = settings.onAction;
    this.onValueUpdated = settings.onValueUpdated;
    this.onSubmit = settings.onSubmit;

    this._init();
    this._initStringController();
  }

  _init() {
    this.el.addEventListener('focusin', (e) => {
      const btn = e.target;
      if (btn && document.activeElement !== e.target) {
        this.select(btn);
      }
    });
  }

  _initStringController() {
    this.stringController = new StringController({
      onStringUpdated: (str) => {
        this.onValueUpdated(str);
      }
    });
  }

  clearItems() {
    this.items = undefined;
  }

  setTemplate(template, options = {
    selectedDefault: undefined,
  }) {
    this.selectedDefault = undefined;
    this.items = [];
    let maxRows = template.length;
    let maxCols = 0;
    for (let i = 0; i < template.length; i++) {
      const row = template[i];
      if (row.length > maxCols) {
        maxCols = row.length;
      }
      for (let j = 0; j < row.length; j++) {
        let item = row[j];

        const isXAxis = this._isPrevDuplicateXAxis(item, template, i, j);
        const isYAxis = this._isPrevDuplicateYAxis(item, template, i, j);
        let dup;
        if (isXAxis) {
          dup = this._getItemByDuplicate(item, isXAxis, template, j, i);
          dup.repeat += 1;
          dup.isXAxis = true;
        } else if (isYAxis) {
          dup = this._getItemByDuplicate(item, false, template, j, i);
          dup.repeat += 1;
        }

        const btn = this._addItem(item, j, i, dup);
        if (options.selectedDefault && btn.content === options.selectedDefault) {
          this.selectedDefault = btn;
        }
      }
    }

    for (let i = 0; i < this.items.length; i++) {
      const row = this.items[i];
      for (let j = 0; j < row.length; j++) {
        let item = row[j];

        if (item.repeat > 1) {
          let column = `${item.x + 1}`;
          let row = `${item.y + 1}`;

          if (item.isXAxis) {
            column += `/span ${item.repeat}`;
          } else {
            row += `/span ${item.repeat}`;
          }
          item.el.style.setProperty('grid-column', column);
          item.el.style.setProperty('grid-row', row);
        }
      }
    }

    this._setStyleGrid({
      rows: maxRows,
      columns: maxCols,
    });
  }

  _getItemByDuplicate(content, isXAxis, template, x, y) {
    let coord;
    let getContent = (n) => { return template[n][x] };
    let getCoord = (n) => { return [x, n] }
    let i = y;

    if (isXAxis) {
      getContent = (n) => { return template[y][n] };
      getCoord = (n) => { return [n, y] };
      i = x;
    }

    while (i > 0) {
      const prev = getContent(i - 1);

      if (prev == content) {
        coord = getCoord(i - 1);
      } else {
        break;
      }
      i -= 1;
    }

    return this._getItemByCoord(coord[0], coord[1]);
  }

  _isPrevDuplicateXAxis(item, template, i, j) {
    if (j <= 0) {
      return false;
    }

    if (item == template[i][j - 1]) {
      return true;
    }

    return false;
  }

  _isPrevDuplicateYAxis(item, template, i, j) {
    if (i <= 0) {
      return false;
    }

    if (item == template[i - 1][j]) {
      return true;
    }

    return false;
  }

  selectDefault() {
    const defaultSelection = this.selectedDefault || this.items[0][0];
    this.deselect();
    this.select(defaultSelection);
  }

  action(btn) {
    if (!btn) {
      return;
    }

    switch (btn.actionType) {
      case 'submit':
        this.onSubmit();
        break;
      case 'deletePrev':
        this.stringController.removeLastCharacter();
        break;
      default:
        this.stringController.append(btn.content);
        break;
    }
  }

  _setStyleGrid(styleData) {
    this.el.style.setProperty('display', 'grid');

    const cell = '1fr ';
    this.el.style.setProperty('grid-template-columns', cell.repeat(styleData.columns));
    this.el.style.setProperty('grid-template-rows', cell.repeat(styleData.rows));
  }

  clearValue() {
    this.stringController.clear();
  }

  setValue(value) {
    this.stringController.setString(value);
  }

  selectLeft() {
    this.select(this.indexX - 1, this.indexY);
  }

  selectRight() {
    this.select(this.indexX + 1, this.indexY);
  }

  selectTop() {
    this.select(this.indexX, this.indexY - 1);
  }

  selectBottom() {
    this.select(this.indexX, this.indexY + 1);
  }

  select(x, y) {
    let item;
    if (Number.isInteger(x) && Number.isInteger(y)) {
      item = this._getItemByCoord(x, y);
    } else {
      item = x;
      x = item.x;
      y = item.y;
    }
    if (this.selectedItem === item) {
      if (item.isXAxis) {
        this.select(item.x + item.repeat, this.indexY);
      } else {
        this.select(this.indexX, item.y + item.repeat);
      }
      return;
    }

    this.indexX = x;
    this.indexY = y;
    this._deselectPrev();

    item.el.focus();
    this.selectedItem = item;

    this._deselectPrev = () => {
      item.el.blur();
    };
  }

  _getItemByCoord(x, y) {
    y = wrapAround(y, 0, this.items.length - 1);
    const row = this.items[y];
    x = wrapAround(x, 0, row.length - 1);

    return row[x];
  }

  deselect() {
    this._deselectPrev();
    this._deselectPrev = noop;
  }

  _addItem(item, x, y, duplicate) {
    const row = this.items[y] || [];

    const content = item.content != undefined ? item.content : item;
    let btn;
    if (duplicate) {
      btn = duplicate;
    } else {
      btn = new Button({
        content,
        enableDefaultEvents: false,
        className: 'btn',
        action: () => {
          this.action(btn);
        },
      });

      btn.content = content;
      btn.x = x;
      btn.y = y;
      btn.actionType = item.actionType;
      btn.repeat = 1;
      if (!item.action) {
        this.contentValues.push(content);
      }
    }

    row[x] = btn;
    this.items[y] = row;
    this.el.append(btn.el);

    return btn;
  }
}
