import { isFunction, isNotString } from "../primer/utils/utils.mjs";
import { ObserverSingleton } from "./observer-singleton.mjs";

export class DynamicIconManager {
  constructor() {
    this.observer = new ObserverSingleton();

    // [NavAction]: HTMLElement | String
    this.iconMap = {};
    this.dynIcons = [];

    this.observer.observeClassName('nui-dyn-icon', (component) => {
      return this.connectDynamicIcon(component);
    });
  }

  setIconMap(map) {
    this.iconMap = map;

    this._updateDynamicIcons();
  }

  _updateDynamicIcons() {
    for (const icon of this.dynIcons) {
      const content = this._getIcon(icon.key);
      icon.setContent(content);
    }
  }

  _getIcon(navAction) {
    let icon = this.iconMap[navAction] || navAction;

    if (isFunction(icon.cloneNode)) {
      icon = icon.cloneNode(true);
    }

    return icon;
  }

  connectDynamicIcon(component) {
    if (!component.key) {
      console.warn('Invalid dynamic icon provided');
    }

    this.dynIcons.push(component);
    const content = this._getIcon(component.key);
    component.setContent(content);

    return () => {
      const index = this.dynIcons.indexOf(component);
      this.dynIcons.splice(index, 1);
    }
  }
}
