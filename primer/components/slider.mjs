import { addEventListener, addMouseListener, clamp, noop, throttle } from '../utils/utils.mjs';
import { Component } from './component.mjs';
import { valuable } from '../component-mutators/valuable.mjs';

/**
 * @typedef {Object} SliderParams
 * @property {number?} max
 * @property {number?} min
 * @property {number?} step
 * @property {number?} value
 * @property {Function?} onFocus
 * @property {Function?} onBlur
 * @property {Function?} onChanged
 * @property {string?} direction
 */

const defaults = {
  min: 0,
  max: 100,
  step: 10,
  value: 0,
  direction: 'auto',
  thumbWithinBounds: true,
  onChanged: noop,
}

export class Slider extends Component {
  /**
   *
   * @param {SliderParams} settings
   */
  constructor(settings) {
    settings = {...defaults, ...settings};

    settings.tagName = 'div',
    super(settings);
    this.el.classList.add('slider');

    valuable(this, {
      value: settings.value
    });

    this.stepValue = settings.step;
    this.onChanged = settings.onChanged;
    this.onWorkingChanged = settings.onWorkingChanged;
    this.direction = settings.direction;
    this.thumbWithinBounds = settings.thumbWithinBounds;

    this.min = settings.min;
    this.max = settings.max;

    this.mouseEventEl = this.el;
    this.removeMouseEvents = noop;

    this._addMouseActions();

    this._createContents();
  }

  setMouseEventElement(el) {
    this.mouseEventEl = el;
    this._addMouseActions();
  }

  _addMouseActions() {
    this.removeMouseEvents();
    this.removeMouseEvents = addMouseListener(this.mouseEventEl, {
      throttle: 40,
    }, (e) => {
      const pos = this._isVertical() ? e.clientY : e.clientX;
      const value = this._getValueByScreenPos(pos);
      this.setValue(value);
    });
  }

  _getValueByScreenPos(pos) {
    const rect = this.bar.getBoundingClientRect();
    let offset = rect.x;
    if (this._isVertical()) {
      offset = rect.y;
    }

    const thumbWidth = this._getThumbWidth();
    let relative = pos - offset;
    if (this.thumbWithinBounds) {
      relative = relative - thumbWidth / 2;
    }

    const value = this._getValueByPx(relative);

    return value;
  }

  _createContents() {
    const bar = document.createElement('span');
    this.bar = bar;
    bar.classList.add('bar');

    const thumb = document.createElement('span');
    this.thumb = thumb;
    thumb.classList.add('thumb');

    this.el.append(bar);
    this.el.append(thumb);
  }

  _getValueByPx(pos) {
    const width = this._getLength();
    let percent = pos / width;

    const thumbWidth = this._getThumbWidth();
    if (this.thumbWithinBounds) {
      percent = pos / (width);
    }

    return this.max * percent;
  }

  _isVertical() {
    if (this.direction == 'auto') {
      return this.bar.clientHeight > this.bar.clientWidth;
    }

    return this.direction == 'vertical';
  }

  _getThumbWidth() {
    if (this._isVertical()) {
      return this.thumb.clientHeight;
    }

    return this.thumb.clientWidth;
  }

  _getThumbHalf() {
    if (this._isVertical()) {
      return this.thumb.clientHeight / 2;
    }

    return this.thumb.clientWidth / 2;
  }

  _getLength() {
    let length = this.bar.clientWidth; 
    if (this._isVertical()) {
      length = this.bar.clientHeight;
    }

    if (this.thumbWithinBounds) {
      const thumbWidth = this._getThumbWidth();
      length -= thumbWidth;
    }

    return length;
  }

  _getWidth() {
    if (this._isVertical()) {
      return this.bar.clientWidth;
    }

    return this.bar.clientHeight;
  }

  _updateThumbPosition() {
    const thumbWidthHalf = this._getThumbHalf();
    const length = this._getLength();
    const width = this._getWidth();
    let pos = this.value / (this.max - this.min);
    
    let thumbPos = length * pos;
    let leftPos = this.bar.clientLeft;

    if (!this.thumbWithinBounds) {
      thumbPos -= thumbWidthHalf;
    }

    thumbPos = clamp(thumbPos, leftPos - thumbWidthHalf, leftPos + length);

    if (this._isVertical()) {
      const offset = (width - this.thumb.clientWidth) / 2;
      this.thumb.style.setProperty('top', `${thumbPos}px`);
      this.thumb.style.setProperty('left', `${offset}px`);
    } else {
      const offset = (width - this.thumb.clientHeight) / 2;
      this.thumb.style.setProperty('top', `${offset}px`);
      this.thumb.style.setProperty('left', `${thumbPos}px`);
    }
  }

  stepUp() {
    this.step(this.stepValue);
  }

  stepDown() {
    this.step(-this.stepValue);
  }

  step(value) {
    value = this.value + value;

    this.setValue(value);
  }

  update() {
    this._updateThumbPosition();
  }

  setValue(value) {
    value = Number.parseFloat(value);
    value = clamp(value, this.min, this.max);
    this._setValue(value);

    this.update();
  }

  setThumbColor(color) {
    this.thumb.style.setProperty('box-shadow', `inset 0 0 0 100vw ${color}`);
  }
}
