import { clamp, isArray, isNotString, isNumber, isString } from "./utils.mjs";

function sanitizeRgb(r, g, b, a) {
    if (isArray(r)) {
        const color = r;
        r = color[0];
        g = color[1];
        b = color[2];
    }

    if (isNumber(a)) {
        a = clamp(a, 0, 1);
    } else {
        a = 1;
    }
  
    r = clamp(r, 0, 255);
    g = clamp(g, 0, 255);
    b = clamp(b, 0, 255);

    return [r, g, b, a];
}

/**
 * 
 * @param {Number | Array} r // 0-255 or [Integer, Integer, Integer, Float]
 * @param {Number} g // 0-255
 * @param {Number} b // 0-255
 * @param {Number} a // 0-1 
 * @returns 
 */
export function rgbToHex(r, g, b, a) {
    const [r2, g2, b2, a2] = sanitizeRgb(r, g, b, a);
    r = r2; b = b2; g = g2; a = a2;

    const hasAlpha = isNumber(a);
    
    // https://stackoverflow.com/questions/5623838/rgb-to-hex-and-hex-to-rgb
    let hex = '#' + ((1 << 24) | (r << 16) | (g << 8) | b).toString(16).slice(1);

    if (hasAlpha) {
        a *= 255;
        clamp(a, 0, 255);

        hex = hex + (a | 1 << 8).toString(16).slice(1);
    }
    
    return hex;
  }

  /**
   * 
   * @param {String} hex 
   */
  export function hexToRGB(hex) {
    if (isNotString(hex)) {
        console.warn('Wrong parameter type. Must be of type "string".');
        return;
    }

    if (isNotHex(hex)) {
        console.warn('Wrong parameter type. Must be a hex value.');
    }

    // Remove hashtag
    hex = hex.substring(1);

    // shorthand RGB channels
    const length = hex.length;
    if (length == 3 || length == 4) {
        const temp = hex;
        hex = '';
        // explode the shortcut by doubling each character
        // f0E becomes ff00EE
        for (const c of temp) {
            hex += c + c;
        }
    }

    const rgb = [];
    rgb[0] = parseInt(hex.substring(0, 2), 16);
    rgb[1] = parseInt(hex.substring(2, 4), 16);
    rgb[2] = parseInt(hex.substring(4, 6), 16);
    rgb[3] = 1;
    
    if (hex.length >= 8) {
        rgb[3] = parseInt(hex.substring(6, 8), 16) / 255;
    }

    return rgb;
  }

  // https://stackoverflow.com/questions/29461757/how-to-display-hwb-hsb-cmyk-channels-using-rgb-or-hsl
  export function rgbToHwb(r, g, b, a) {
    const [r2, g2, b2, a2] = sanitizeRgb(r, g, b, a);
    r = r2; b = b2; g = g2; a = a2;

    r /= 255;
    g /= 255;
    b /= 255;

    let f, i,
      w = Math.min(r, g, b),
      v = Math.max(r, g, b),
      black = 1 - v;
  
    if (v === w) return [0, w, black];
    f = r === w ? g - b : (g === w ? b - r : r - g);
    i = r === w ? 3 : (g === w ? 5 : 1);

    return [
        (i - f / (v - w)) / 6 * 360, 
        w,
        black,
        a != undefined ? a : 1,
    ];
  }

  // https://en.wikipedia.org/wiki/HSL_and_HSV#To_RGB
  /* 
    f(n)= V-VSmax(0,min(k,4-k,1))
    k = (n + H/60) % 6
  */
  function hsvToRgbFormula(h, s, v, n) {
    const k = (n + h / 60) % 6;
    return v - (v * s * Math.max(0, Math.min(k, 4-k, 1)));
  }

  export function hsvToRgb(h, s, v, a) {
    if (isArray(h)) {
        const color = h;
        h = color[0];
        s = color[1];
        v = color[2];
        a = color[3];
    }
  
    h = clamp(h, 0, 359);
    s = clamp(s, 0, 1);
    v = clamp(v, 0, 1);

    return [
        Math.round(hsvToRgbFormula(h, s, v, 5) * 255),
        Math.round(hsvToRgbFormula(h, s, v, 3) * 255),
        Math.round(hsvToRgbFormula(h, s, v, 1) * 255),
        a != undefined ? a : 1,
    ];
  }

  // http://alvyray.com/Papers/CG/HWB_JGTv208.pdf
  /* To HSV:
        H = H
        S = 1 - (W / (1 - B))
        V = 1 - B
  */
  export function hwbToHsv(h, w, b, a) {
    if (isArray(h)) {
        const color = h;
        h = color[0];
        w = color[1];
        b = color[2];
        a = color[3];
    }
  
    h = clamp(h, 0, 359);
    w = clamp(w, 0, 1);
    b = clamp(b, 0, 1);

    const s = 1 - (w / (1- b));
    const v = 1 - b;

    return [
        h,
        s,
        v,
        a != undefined ? a : 1,
    ];
  }

  // https://stackoverflow.com/questions/29461757/how-to-display-hwb-hsb-cmyk-channels-using-rgb-or-hsl
  export function hwbToRgb(h, w, b, a) {
    if (isArray(h)) {
        const color = h;
        h = color[0];
        w = color[1];
        b = color[2];
        a = color[3];
    }
  
    h = clamp(h, 0, 359);
    w = clamp(w, 0, 1);
    b = clamp(b, 0, 1);

    const hsv = hwbToHsv(h, w, b, a);
    return hsvToRgb(hsv);
  }

  function stringRBGToRGBArray(rgbString) {
    if (rgb.includes('rgb(')) {
        rgb = rgb.split('rgb(')[1];
    }
    else if (rgb.includes('rgba(')) {
        rgb = rgb.split('rgba(')[1];
    }

    if (!rgb) {
        console.warn('Wrong value. Expects "rgb()" string value type');
        return;
    }

    rgb = rgb.split(')')[0];
    rbg = rgb.split(',');

    return rbg;
  }

  /**
   * 
   * @param {Array<Number>} rbgArray 
   */
  export function clampRBG(color) {
    let value = [];
    value[0] = isNumber(color[0]) ? clamp(color[0], 0, 255) : 0;
    value[1] = isNumber(color[1]) ? clamp(color[1], 0, 255) : 0;
    value[2] = isNumber(color[2]) ? clamp(color[2], 0, 255) : 0;
    value[3] = isNumber(color[3]) ? clamp(color[3], 0, 1) : 1;

    return value;
  }

  // eg. "hwb(0deg 0% 0% / 75%)"
  // or
  // "hwb(0deg 0 0 / 0.75)"
  export function stringToHwb(str) {
    let values = [];
    if (str.includes('hwb(')) {
        str = str.split('hwb(')[1];
    }


    if (!str) {
        console.warn('Wrong value. Expects "rgb()" string value type');
        return;
    }

    str = str.split(')')[0];
    str = str.replace('/', '');
    let i = 0;
    let arr = str.split(' ');

    values[0] = parseInt(arr[0]);
    values[1] = parseInt(arr[1]);
    values[2] = parseInt(arr[2]);
    values[3] = parseFloat(arr[3] || 1);

    if (arr[1].includes('%') || values[1] > 1) {
      values[1] /= 100;
    }

    if (arr[2].includes('%') || values[2] > 1) {
      values[2] /= 100;
    }

    if (arr[3] && (arr[3].includes('%') || values[3] > 1)) {
      values[3] /= 100;
    }

    return values;
  }

  /**
   * 
   * @param {string} rgb // Must be a string rgb() or rgba() value 
   * @returns {Array<Number>}
   */
  export function stringToRGB(str) {
    let values = [];
    if (str.includes('rgb')) {
        values = stringRBGToRGBArray(str);
    }

    values[0] = Number.parseInt(values[0] || 0);
    values[1] = Number.parseInt(values[1] || 0);
    values[2] = Number.parseInt(values[2] || 0);

    if (values[3] != undefined) {
        values[3] = Number.parseFloat(values[3]);
    }

    clampRBG(values);

    return values;
  }

  /**
   * 
   * @param {string} rgba // Must be a string rgb() or rgba() value 
   */
  export function stringToRGBA(rgba) {
    const values = stringToRGB(rgba);

    if (values[3] == undefined) {
        values[3] = 1;
    }

    return values;
  }

  export function hwbToString(hwb, ignoreAlpha = false) {
    let [h, w, b, a] = hwb;


    if (a == 1 || ignoreAlpha || a == undefined) {
        return `hwb(${h}deg ${w}% ${b}%)`;
    }
    return `hwb(${h}deg ${w}% ${b}% / ${a})`;
  }

  export function isHwb(color) {
    if (isNotString(color)) {
        return false;
    }

    return color.includes('hwb');
  }

  export function isHex(color) {
    if (isNotString(color)) {
        return false;
    }

    return color.includes('#');
  }

  export function isNotHex(color) {
    return !isHex(color);
  }

  /**
   * 
   * @param {String} color 
   * @param {Boolean} isStrict // if true, only an RGB value is accepted, and a RGBA value returns false 
   * @returns 
   */
  export function isRGB(color, isStrict = true) {
    if (isNotString(color)) {
        return false;
    }

    let isRGB = false;

    if (color.includes('rgb(')) {
        isRGB = true;
    }

    if (!isStrict && color.includes('rgba(')) {
        isRGB = true;
    }

    return isRGB;
  }

  export function isNotRGB(color, isStrict = true) {
    return !isRGB(color, isStrict);
  }

  export function isRGBA(color, isStrict = true) {
    if (isNotString(color)) {
        return false;
    }

    let isRGB = false;

    if (color.includes('rgba(')) {
        isRGB = true;
    }

    if (!isStrict && color.includes('rgb(')) {
        isRGB = true;
    }

    return isRGB;
  }

  export function isNotRGBA(color, isStrict = true) {
    return !isRGBA(color, isStrict);
  }
