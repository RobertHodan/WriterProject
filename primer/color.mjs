import { clampRBG, hexToRGB, hwbToRgb, hwbToString, isHex, isHwb, isRGB, rgbToHex, rgbToHwb, stringToHwb, stringToRGB, stringToRGBA } from "./utils/colors.mjs";
import { clamp, isArray, isNotArray, isNumber } from "./utils/utils.mjs";

export function isColorObject(color) {
    if (typeof(color) == 'object' && color.isColorObject) {
        return true;
    }

    return false;
}

export const ColorTypes = {
    RGB: 'rgb',
    HWB: 'hwb',
}

export class Color {
    constructor(color) {
        // As RGBA
        this.value = [0, 0, 0, 1];
        this.isColorObject = true;
        this.type = ColorTypes.RGB;
        
        if (color != undefined) {
            color = this._getColor(color);
            this.value = color;
        }

        this.listeners = [];
        this.listenerRemovers = [];
    }

    toString() {
        const v = this.value;
        if (v[3] == 1) {
            return `rgb(${v[0]},${v[1]},${v[2]})`
        }
        return `rgba(${v[0]},${v[1]},${v[2]},${v[3]})`;
    }

    addListener(callback) {
        this.listeners.push(callback);

        const remover = this.listenerRemovers.push(() => {
            const index = this.listeners.indexOf(callback);
            this.listeners.splice(index, 1);

            const removerIndex = this.listenerRemovers.indexOf(remover);
            this.listenerRemovers.splice(removerIndex, 1);
        });

        return remover;
    }

    _isColorEqual(arrA, arrB) {
        if (isNotArray(arrA) || isNotArray(arrB)) {
            return false;
        }

        if (arrA[0] != arrB[0]) {
            return false;
        }

        if (arrA[1] != arrB[1]) {
            return false;
        }

        if (arrA[2] != arrB[2]) {
            return false;
        }

        if (arrA[3] != arrB[3]) {
            return false;
        }

        return true;
    }

    _isColorNotEqual(arrA, arrB) {
        return !this._isColorEqual(arrA, arrB);
    }

    onColorChanged(color) {
        for (const listener of this.listeners) {
            listener(color);
        }
    }

    setValue(color) {
        const value = this._getColor(color);

        const prevColor = this.value;

        if (value != undefined) {
            this.value = value;
        }

        if (this._isColorNotEqual(this.value, prevColor)) {
            this.onColorChanged(value);
        }
    }

    asRGB() {
        return [
            this.value[0],
            this.value[1],
            this.value[2],
            this.value[3],
        ];
    }

    asHex() {
        return rgbToHex(this.value);
    }

    asHWB() {
        return rgbToHwb(this.value);
    }

    _getColor(color) {
        if (color.isColorObject) {
            return color.value;
        }

        if (isRGB(color, false)) {
            return stringToRGBA(color);
        }

        if (isHex(color)) {
            return hexToRGB(color);
        }

        if (isHwb(color)) {
            return hwbToRgb(color);
        }

        return undefined;
    }

    isSupportedColor(color) {
        if (isRGB(color, false)) {
            return true;
        }

        if (isHex(color)) {
            return true;
        }

        if (isHwb(color)) {
            return true;
        }

        return false;
    }
}

export class ColorHWB  extends Color {
    constructor(color) {
        super(color);

        this.type = ColorTypes.HWB;
    }

    toString(ignoreAlpha = false) {
        return hwbToString([
            this.value[0],
            this.value[1] * 100,
            this.value[2] * 100,
            this.value[3]
        ], ignoreAlpha);
    }

    _getColor(color) {
        if (color.isColorObject) {
            return color.value;
        }

        if (isArray(color)) {
            return color;
        }

        if (isRGB(color, false)) {
            return rgbToHwb(color);
        }

        if (isHex(color)) {
            const rgb = hexToRGB(color);
            return rgbToHwb(rgb);
        }

        if (isHwb(color)) {
            return stringToHwb(color);
        }

        return undefined;
    }

    asRGB() {
        return hwbToRgb(this.value);
    }

    asHex() {
        const rgb = hwbToRgb(this.value);
        return rgbToHex(rgb);
    }

    asHWB() {
        return [
            this.value[0],
            this.value[1],
            this.value[2],
            this.value[3],
        ];
    }
}
