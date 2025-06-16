import { ColorHWB, isColorObject } from "../../color.mjs";
import { addMouseListener, clamp, isNotNumber, noop } from "../../utils/utils.mjs";
import { Component } from "../component.mjs";

const defaults = {
  className: 'color-selection-box',
}

export class ColorSelectionBox extends Component {
  constructor(settings) {
    settings = {...defaults, ...settings};
    super(settings);

    this.removeListenerColor = noop;
    this.hwb = new ColorHWB(settings.color || '#FF0000');
    this.setColor(settings.color || this.hwb);

    this.gradient = document.createElement('img');
    this.gradient.src = '/images/white-black-gradient-2-axis.png';
    this.gradient.classList.add('gradient');
    this.append(this.gradient);

    this.cursor = this._createSelectionCursor();
    this.append(this.cursor);

    addMouseListener(this.el, undefined, (event) => {
      let {x, y} = event;
      const {left, top, width, height} = this.el.getBoundingClientRect(); 
      const cursorX = clamp(x - left, 0, width);
      const cursorY = clamp(y - top, 0, height);
      
      let black = cursorY / height;

      const segmentNumMax = (1 - black) * 100;
      let segmentWidth = width / segmentNumMax;
      if (isNotNumber(segmentWidth)) {
        segmentWidth = 0;
      }

      let whiteSegmentValue = cursorX / segmentWidth / 100;
      if (isNotNumber(whiteSegmentValue)) {
        whiteSegmentValue = 0;
      }

      let white = (1 - black) - whiteSegmentValue;

      this.hwb.setValue([
        this.hwb.value[0],
        white,
        black,
        this.hwb.value[3]
      ]);

      if (white == 0) {
        this.setCursorPosition(cursorX, cursorY);
      }
    });
  }

  update() {
    this.updateColor();
  }

  onColorChanged(color) {
    this.updateColor();
  }

  setColor(color) {
    let isNewColorObject = false;
    if (isColorObject(color) && color != this.color) {
      this.hwb = color;
      this.isNewColorObject = true;
    } else {
      this.hwb.setValue(color);
    }

    if (isNewColorObject || this.removeListenerColor == noop) {
      this.removeListenerColor();
      this.removeListenerColor = this.hwb.addListener(() => {
        this.updateColor();
      });
    }
  }

  setCursorPosition(x, y) {
    if (!this.cursor) {
      return;
    }
    
    const halfWidth = this.cursor.clientWidth / 2;
    const halfHeight = this.cursor.clientHeight / 2;
    const {width, height} = this.el.getBoundingClientRect();

    x = clamp(x, 0, width);
    y = clamp(y, 0, height);

    this.cursor.style.setProperty('left', `${x - halfWidth}px`);
    this.cursor.style.setProperty('top', `${y - halfHeight}px`);
  }

  updateCursorPosition() {
    const [width, height] = this.getSize();
    const [hue, white, black] = this.hwb.value;

    const segmentNumMax = (1 - black) * 100;
    let segmentWidth = width / segmentNumMax;
    if (isNotNumber(segmentWidth)) {
      segmentWidth = 0;
    }

    const whiteSegmentNum = segmentNumMax - (white * 100); 

    const x = segmentWidth * whiteSegmentNum;
    const y = height * black;

    this.setCursorPosition(x, y);
  }

  getCursorPosition() {
    let left = this.cursor.style.getPropertyValue('left');
    left = Number.parseFloat(left) || 0;

    let top = this.cursor.style.getPropertyValue('top');
    top = Number.parseFloat(top) || 0;

    return [left, top];
  }

  getSize() {
    const rect = this.el.getBoundingClientRect();
    
    return [rect.width, rect.height];
  }

  getValuePercentage() {
    const [left, top] = this.getCursorPosition();
    const [width, height] = this.getSize();

    const widthPercent = left / width;
    const heightPercent = top / height;

    return [widthPercent, heightPercent];
  }

  setBackgroundColor(color) {
    this.gradient.style.setProperty('background', color);
  }

  setCursorColor(color) {
    this.cursor.style.setProperty('background', color);
  }

  updateCursorColor() {
    this.setCursorColor(this.hwb.toString(true));
  }

  updateColor() {
    const [hue, white, black] = this.hwb.value;
    
    this.updateCursorPosition();
    this.updateCursorColor();
    this.setBackgroundColor(`hwb(${hue}deg 0 0)`);
  }

  _createSelectionCursor() {
    const cursor = document.createElement('span');
    cursor.classList.add('cursor');

    return cursor;
  }

  // No longer in use.
  // TODO: Refactor as utility function
  _createGradient() {
    const canvas = document.createElement('canvas');
    canvas.setAttribute('height', '255px');
    canvas.setAttribute('width', '255px');
    canvas.classList.add('gradient');

    const context = canvas.getContext('2d', {
      alpha: true,
      willReadFrequently: false,
    });

    const colorClear = '#ffffff00';
    const colorWhite = '#ffffff';
    const colorBlack = '#000000';

    const gradientHoriz = context.createLinearGradient(0, 0, 255, 0);

    gradientHoriz.addColorStop(0, colorWhite);
    gradientHoriz.addColorStop(1, colorClear);

    context.fillStyle = gradientHoriz;
    context.fillRect(0, 0, 255, 255);

    const gradientVert = context.createLinearGradient(0, 0, 0, 255);

    gradientVert.addColorStop(0, colorClear);
    gradientVert.addColorStop(1, colorBlack);

    context.fillStyle = gradientVert;
    context.fillRect(0, 0, 255, 255);

    return canvas;
  }
}