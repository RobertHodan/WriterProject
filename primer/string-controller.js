import { noop } from "./utils/utils.mjs";

export const StringControllerDefaults = {
  onStringUpdated: noop,
}

export class StringController {
  constructor(options = StringControllerDefaults) {
    options = {...StringControllerDefaults, ...options};

    this.str = "";

    this.onStringUpdated = options.onStringUpdated;
  }

  getString() {
    return this.str;
  }

  append(str) {
    this.setString(this.str + str);
  }

  removeLastCharacter() {
    let str = this.str.substring(0, this.str.length-1);

    this.setString(str);
  }

  clear() {
    this.setString("");
  }

  setString(str) {
    if (str == this.str) {
      return;
    }

    this.str = str;

    this.onStringUpdated(str);
  }
}
