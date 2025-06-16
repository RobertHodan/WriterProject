import { isInteger, isNumber } from './utils/utils.mjs';

const wrongValueType = function(smartValueType, valueType, value) {
  console.error(`${smartValueType} was given a non-${valueType} value: ${value}`);
}

export function isSmartValue(value) {
  if (typeof(value) != 'object') {
    return false;
  }

  return value.isSmartValue;
}

export function isNotSmartValue(value) {
  return !isSmartValue(value);
}

export class SmartValue {
  constructor(value) {
    value = this.parseValue(value);
    this.assert(value);

    this.value = value;
    this.listeners = [];
    this.isSmartValue = true;
  }

  printError(value) {

  }

  parseValue(value) {
    return value;
  }

  assert(value) {
    return true;
  }

  addListener(callback) {
    this.listeners.push(callback);

    return () => {
      const index = this.listeners.indexOf(callback);
      this.listeners.splice(index, 1);
    }
  }

  getValue() {
    return this.value;
  }

  setValue(value, sharedId) {
    if (isSmartValue(value)) {
      value = value.getValue();
    }
    value = this.parseValue(value);

    if (!this.assert(value)) {
      this.printError(value);
      return false;
    }
    if (this.value === value) {
      return false;
    }

    this.value = value;

    for (const listener of this.listeners) {
      listener(value, sharedId);
    }

    return true;
  }
}

export class SmartNumber extends SmartValue {
  constructor(value) {
    super(value);
  }

  assert(value) {
    return isNumber(value);
  }

  printError(value) {
    wrongValueType('SmartNumber', 'Number', value);
  }

  parseValue(value) {
    return Number.parseFloat(value);
  }
}

export class SmartInteger extends SmartValue {
  constructor(value) {
    super(value);
  }

  assert(value) {
    return isInteger(value);
  }

  printError(value) {
    wrongValueType('SmartInteger', 'Integer', value);
  }

  parseValue(value) {
    return Number.parseInt(value);
  }
}
