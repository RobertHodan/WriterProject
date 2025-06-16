import { arrayToString, mergeArrays } from "./array.mjs";
import { isArray, isString } from "./utils.mjs";

const objectToStringDefault = {
  // Incomplete for functions
  whiteSpace: 2,
  collapseObjects: false,
  collapseChildClasses: false,
  collapseFunctions: false,
}

export function objectToString(obj, settings, callCount = 1) {
  settings = {... objectToStringDefault, ...settings};
  let result = '';

  if (obj.constructor && obj.constructor.name != 'Object' && obj.constructor.name != 'Array') {
    let name = obj.constructor.name;
    const nameArr = name.split(' ');
    name = nameArr[nameArr.length-1];

    result += name + ' ';
  }

  result += `{`;

  let properties = getPropertyNames(obj);
  for (let property of properties) {
    if (property == 'constructor') {
      continue;
    }

    result += '\n';

    result += ' '.repeat(settings.whiteSpace * callCount);

    const value = obj[property];
    if (typeof(value) == 'object') {
      // Regular object
      if (Array.isArray(value)) {
        result += `${property}: `;
        result += arrayToString(value);
      } else if (value.constructor.name == 'Object') {
        result += `${property}: `;
        if (settings.collapseObjects) {
          result += '{}';
        } else {
          result += objectToString(value, settings, callCount+1);
        }
      } else {
        // Collapsed Class Objects
        if (settings.collapseChildClasses) {
          result += `${property} {}`;
        // Class Objects
        } else {
          result += `${property}: `;
          result += objectToString(value, settings, callCount+1);
        }
      }
      // Functions
    } else if(typeof(value) == 'function') {
      let funcStr = '';
      if (settings.collapseFunctions) {
        let bound = value.name.split('bound ');
        const name = bound.length > 1 ? bound[1] : temp1.name;
        funcStr = name + '() {}';
      } else {
        funcStr = value.toString();
        // Anonymous Function
        if (funcStr.trim().includes(') => ')) {
          result += `${property}: `;
        }
      }


      result += funcStr;
      // All Other Properties
    } else if (typeof(value) == 'string') {
      result += `${property}: `;
      result += `"${obj[property]}"`;
    } else {
      result += `${property}: `;
      result += obj[property];
    }
    result += ',';
  }

  if (properties.length > 0) {
    result += '\n';
  }

  result += ' '.repeat(settings.whiteSpace * (callCount-1));
  result += '}';

  return result;
}

export function getPropertyNames(obj, ignoreNormalObjects, callCount = 1) {
  let properties = Object.getOwnPropertyNames(obj);
  const name = obj.constructor.name;

  if (ignoreNormalObjects) {
    if (name == 'Object' || name == 'Array') {
      return [];
    }
  }

  if (callCount <= 1) {
    if (!properties.includes('constructor')) {
      const proto = getPropertyNames(obj.constructor.prototype, callCount+1);
      properties = mergeArrays(properties, proto);
    }
  }

  return properties;
}

export function applyClassName(element, className) {
  if (isString(className)) {
    element.classList.add(className);
  } else if (isArray(className)) {
    for (const name of className) {
      element.classList.add(name);
    }
  }
}
