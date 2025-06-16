import { Color, ColorHWB, isColorObject } from "../../color.mjs";
import { rgbToHwb } from "../../utils/colors.mjs";
import { noop } from "../../utils/utils.mjs";
import { Slider } from "../slider.mjs";

const defaults = {
  className: 'color-slider',
}

export const SLIDERAXIS = {
  VERTICAL: 'vertical',
  HORIZONTAL: 'horizontal'
};

export class ColorSlider extends Slider {
  constructor(settings) {
    settings = {...defaults, ...settings};
    super(settings);

    this.color = new ColorHWB(settings.color);
    this.setColor(settings.color || '#FF0000');

    this.unbindAllColorEvents = noop;
    this.stepValue = settings.stepValue || 0.2;
    this.mouseEventEl = this.bar;
    this._addMouseActions();
  }

  stepUp() {
    this.step(this.stepValue);
  }

  stepDown() {
    this.step(-this.stepValue);
  }

  step(stepValue) {
    if (!stepValue) {
      stepValue = this.stepValue;
    }

    this.setValue(this.value + stepValue);
  }

  onValueChanged(percent) {
  }

  setThumbColor(color) {
  }

  _bindColorEvents() {
    this.unbindAllColorEvents();
  }

  setColor(color) {
    if (isColorObject(color)) {
      this.color = color;
    } else {
      this.color.setValue(color);
    }
  }

  setBackgroundColor(color) {
    this.bar.style.setProperty('background', color);

    this.setColor(color);
  }

  getSelectedColor() {
    return '';
  }

  refreshBackgroundColor() {
    this.setBackgroundColor(this.color.asHex());
  }
}

const defaultsOpacity = {
  className: 'hue-slider',
}
export class OpacitySlider extends ColorSlider {
  constructor(settings) {
    settings = {...defaultsOpacity, ...settings};
    super(settings);

    this._bindColorEvents();
  }

  onRender() {
    super.onRender();

    this.updateValue();
    this.update();
  }

  update() {
    super.update();

    this.setBackgroundColor(this.color.toString(true));
    this.setThumbColor(this.color.toString());
  }

  _bindColorEvents() {
    this.unbindAllColorEvents();

    this.unbindAllColorEvents = this.color.addListener(() => {
      this.update();
    });
  }

  onValueChanged(value) {
    this.color.value[3] = value / 100;
    const color = this.color.toString(true);

    this.setBackgroundColor(color);
    this.update();
  }

  setThumbColor(color) {
    this.thumb.style.setProperty('box-shadow', `0 0 0 100vw ${color} inset`);
  }

  setBackgroundColor(color) {
    const isVert = this._isVertical();

    const deg = isVert ? '180deg' : '-90deg';

    this.bar.style.setProperty('background', `linear-gradient(${deg}, ${color}, transparent)`);
  }

  updateValue() {
    if (this.isHidden()) {
      return;
    }
    
    const alpha = this.color.value[3] || 1;
    this.value = alpha * 100;
  }
}

const defaultsHue = {
  className: 'hue-slider',
}
export class HueSlider extends ColorSlider {
  constructor(settings) {
    settings = {...defaultsHue, ...settings};
    super(settings);

    const hue = this._createHue();
    this.append(hue);
  }

  update() {
    this.updateValue();
    super.update();

    const [hue] = this.color.value;
    this.setThumbColor(`hwb(${hue} 0 0)`);
  }

  onValueChanged() {
    if (!this.canvas || !this.canvasContext) {
      return;
    }

    const hwb = [...this.color.value];
    hwb[0] = 360 - 360 * (this.value / 100);
    
    this.color.setValue(hwb);
  }

  setThumbColor(color) {
    this.thumb.style.setProperty('background', color);
  }

  setBackgroundColor(color) {
    super.setBackgroundColor(color);

    if (!color.includes('#')) {
      console.warn("Color Slider expects a hex color");
      return;
    }

    this.setColor(color);
  }

  updateValue() {
    if (this.isHidden()) {
      return;
    }

    const [hue, white, black] = this.color.value;
    this.value = 100 - (hue / 360 * 100);
  }

  _createHue() {
    const canvas = document.createElement('canvas');
    canvas.setAttribute('height', '1px');
    canvas.setAttribute('width', '1530px');
    canvas.classList.add('gradient');
    this.canvas = canvas;

    this.canvasContext = canvas.getContext('2d', {
      alpha: false,
      willReadFrequently: false,
    });

    const gradientHoriz = this.canvasContext.createLinearGradient(0, 0, 1530, 1);

    gradientHoriz.addColorStop(0/6, 'rgb(255, 0, 0)');
    gradientHoriz.addColorStop(1/6, 'rgb(255, 0, 255)');
    gradientHoriz.addColorStop(2/6, 'rgb(0, 0, 255)');
    gradientHoriz.addColorStop(3/6, 'rgb(0, 255, 255)');
    gradientHoriz.addColorStop(4/6, 'rgb(0, 255, 0)');
    gradientHoriz.addColorStop(5/6, 'rgb(255, 255, 0)');
    gradientHoriz.addColorStop(6/6, 'rgb(255, 0, 0)');

    this.canvasContext.fillStyle = gradientHoriz;
    this.canvasContext.fillRect(0, 0, 1530, 1);

    return canvas;
  }
}
