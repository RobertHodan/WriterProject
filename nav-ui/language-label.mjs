import { Component } from "../primer/components/component.mjs";
import { isString } from "../primer/utils/utils.mjs";

/**
   * @description Returns a language label. NavUI & LanguageManager are required.
   * @param {string} langKey
   */
 export function createLanguageLabel(langKey) {
  let isLangKey = false;
  if (isLanguageLabelCompatible(langKey)) {
    langKey = langKey.split('@lang:')[1];
    isLangKey = true;
  }

  const className = 'nui-lang-lab';
  const label = new Component({
    className: isLangKey ? className : '',
    content: langKey,
  });
  label.key = langKey;
  label.isLangKey = isLangKey;

  label.onCloned = (clone) => {
    clone.classList.remove(className);
  };

  label.el.onBeforeChildAdded = (child) => {
    let isCompatible = false;
    if (isString(child)) {
      isCompatible = isLanguageLabelCompatible(child);
    }

    const classList = label.el.classList;
    if (isCompatible) {
      label.isLangKey = true;
      label.key = child.split('@lang:')[1];
      if (!classList.contains(className)) {
        label.el.classList.add(className);
      }
    } else {
      if (classList.contains(className)) {
        label.el.classList.remove(className);
      }
    }
  }

  return label;
}

export function isLanguageLabelCompatible(langStr) {
  if (langStr == undefined || !langStr.includes) {
    return false;
  }

  return langStr.includes('@lang:');
}
