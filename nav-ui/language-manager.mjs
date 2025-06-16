import { ObserverSingleton } from "./observer-singleton.mjs";

/**
 * @typedef {Object} LanguageMap
 * @property {string}
 */

export class LanguageManager {
  constructor() {
    this.observer = new ObserverSingleton();

    this.langMap = {};
    this.langLabels = [];

    this.observer.observeClassName('nui-lang-lab', (component) => {
      return this.connectLanguageLabel(component);
    });
  }

  /**
   *
   * @param {LanguageMap} map
   */
  setLanguageMap(map) {
    this.langMap = map;

    this._updateLanguageLabels();
  }

  getLanguageValue(langKey) {
    return this.langMap[langKey] || "[Invalid Key]";
  }

  _updateLanguageLabels() {
    for (const label of this.langLabels) {
      const content = this.getLanguageValue(label.key);
      label.setContent(content);
    }
  }

  connectLanguageLabel(component) {
    if (!component.key) {
      console.warn('Invalid language label provided');
    }

    this.langLabels.push(component);

    const content = this.getLanguageValue( component.key );
    component.setContent(content);

    return () => {
      const index = this.langLabels.indexOf(component);
      this.langLabels.splice(index, 1);
    }
  }
}
