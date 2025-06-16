"use strict";
import { noop } from "../primer/utils/utils.mjs";
import { AccessDenied } from "./core-objects/access-denied.mjs";

export class InjectorTool {
  constructor() {
    this.target;
    this.injectedCode = noop;
  }

  inject(targetClass) {
    this.constructTarget(targetClass);

    if (!this.target.allowOverride) {
      Object.freeze(this.target);
      Object.preventExtensions(this.target);
    }
  }

  runCode(code) {
    // let firstObj = code.trim().split('.')[0] || code;
    // if (window[firstObj]) {
    //   if (code.includes('.')) {
    //     return `TypeError: Cannot read properties of undefined (reading '${code.trim().split('.')[1]}')`;
    //   }

    //   return `ReferenceError: ${firstObj} is not defined`;
    // }

    if (!code.substr(0, 4).includes('this') && code.trim().length) {
      code = 'this.' + code;
    }

    let func = new Function('"use strict"; return ' + code);

    func = func.bind(this.target);

    let val;
    let isError;
    try {
      val = func();

      if (val == undefined) {
        val = "undefined";
      }
    } catch (error) {
      val = error;
      isError = true;
    }

    return val;
  }

  constructTarget(targetClass) {
    this.target = this.constructDependency(targetClass);
  }

  constructDependency(dependency, realParent, fakeParent) {
    const realDependency = new dependency();
    const name = dependency.name;
    let fakeDependency = new dependency();
    delete fakeDependency.dependencies;
    realDependency.real = true;

    if (realParent) {
      realParent[name] = realDependency;
      if (realDependency.denyAccess) {
        fakeParent[name] = new AccessDenied();
      } else {
        fakeParent[name] = fakeDependency;
      }
    }

    // const properties = getPropertyNames(realDependency);
    const properties = Object.getOwnPropertyNames(realDependency.constructor.prototype);
    for (const propName of properties) {
      const prop = fakeDependency[propName];

      if (propName == 'constructor' || propName == 'dependencies') {
        continue;
      }

      if (typeof(prop) == 'function') {
        fakeDependency[propName] = realDependency[propName].bind(realDependency);
        fakeDependency[propName].toString = () => {
          return realDependency[propName].toString();
        };
      } else {
        fakeDependency[propName] = realDependency[propName];
      }
    }

    if (realDependency.dependencies && Array.isArray(realDependency.dependencies)) {
      this.constructDependencies(realDependency.dependencies, realDependency, fakeDependency);
    }

    if (!realDependency.allowOverride) {
      Object.freeze(realDependency);
      Object.preventExtensions(realDependency);

      if (realParent) {
        Object.freeze(fakeDependency);
        Object.preventExtensions(fakeDependency);
      }
    }

    return fakeDependency;
  }

  constructDependencies(dependencies, realParent, fakeParent) {
    for (const dependency of dependencies) {
      this.constructDependency(dependency, realParent, fakeParent);
    }
  }
}