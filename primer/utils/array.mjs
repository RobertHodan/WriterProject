import { isSmartValue } from "../smart-value.mjs";
import { objectToString } from "./element.mjs";
import { isNotArray } from "./utils.mjs";

export function removeFromArray(arr, item) {
  const index = arr.indexOf(item);
  if (index >= 0) {
    arr.splice(index, 1);
  }
}

const defaultIsEqual = function(a, b) {
  return a === b;
};


export function arrayToString(arr) {
  if (isNotArray(arr)) {
    return '[]';
  }
  let result = '[';
  for (let i = 0; i < arr.length; i += 1) {
    const item = arr[i];
    const type = typeof(item);
    if (Array.isArray(item)) {
      result += arrayToString(item);
    } else if (isSmartValue(item)) {
      result += `${item.getValue()}`;
      if (i < arr.length-1) {
        result += ', ';
      }
    } else if (type == 'object') {
      result += objectToString(item);
    } else {
      result += `${item}`;

      if (i < arr.length-1) {
        result += ', ';
      }
    }
  }

  result += ']';

  return result;
}

/**
 * Returns the elements in ArrayB that are absent in ArrayA
 *
 * @param {Array} ArrA 
 * @param {Array} ArrB 
 */
export function getRelativeComplement(ArrA, ArrB) {
  let complements = [];
  for (const b of ArrB) {
    if (!ArrA.includes(b)) {
      complements.push(b);
    }
  }

  return complements;
}

export function isArrayEqual(arrA, arrB, isEqual = defaultIsEqual) {
  if (arrA === arrB) {
    return true;
  }

  if (arrA.length !== arrB.length) {
    return false;
  }

  let equal = true;
  for (let i = 0; i < arrA.length; i++) {
    if (!isEqual( arrA[i], arrB[i] )) {
      equal = false;
      break;
    }
  }

  return equal;
}

// https://stackoverflow.com/questions/1584370/how-to-merge-two-arrays-in-javascript-and-de-duplicate-items
export function mergeArrays(a, b, predicate = (a, b) => a === b) {
  // copy to avoid side effects
  const c = [...a];
  // add all items from B to copy C if they're not already present
  b.forEach((bItem) => (c.some((cItem) => predicate(bItem, cItem)) ? null : c.push(bItem)))
  return c;
}
