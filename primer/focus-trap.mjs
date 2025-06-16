import { stringToElement } from './utils/string.mjs';
import { addEventListener, freezeScroll } from './utils/utils.mjs';

export const FocusTrapDefaults = {
  disabled: true,
}

export function focusTrap(element, options = FocusTrapDefaults) {
  options = {...FocusTrapDefaults, ...options};

  if (!element) {
    console.warn('No element provided');
    return;
  }

  const trapStart = stringToElement(`
    <div tabindex="0" aria-hidden="true" class="trap-start"></div>
  `);

  const trapEnd = stringToElement(`
    <div tabindex="0" aria-hidden="true" class="trap-end"></div>
  `);

  const parent = element.parentElement;
  parent.prepend(trapStart);
  parent.append(trapEnd);

  const removers = [];
  const state = {
    lastFocused: undefined,
  };

  addEventListener(element, 'focusin', (event) => {
    state.lastFocused = event.target;
  });
  addEventListener(trapStart, 'focusin', () => {
    resetFocus(element, state);
  }, element);
  addEventListener(trapEnd, 'focusin', () => {
    resetFocus(element, state);
  }, element);
  addEventListener(window, 'focus', () => {
    resetFocus(element, state);
  }, element);

  // Freeze scroll position
  let unfreeze = freezeScroll();

  const removeEventListeners = () => {
    for (const remover of removers) {
      remover();
    }

    if (unfreeze) {
      unfreeze();
      unfreeze = unfreeze;
    }
  };

  return () => {
    removeEventListeners();

    parent.removeChild(trapStart);
    parent.removeChild(trapEnd);
  };
}

function resetFocus(element, state) {
  let target = getFirstFocusable(element);
  if (target === state.lastFocused) {
    target = getLastFocusable(element);
  }

  if (target) {
    target.focus();
    state.lastFocused = target;
  }
}

function getLastFocusable(element) {
  let last;
  for (let i = element.children.length-1; i >= 0; i -= 1) {
    const child = element.children[i];
    if (child.tabIndex >= 0) {
      last = child;
      break;
    }

    if (child.children.length > 0) {
      const e = getLastFocusable(child);
      if (e) {
        last = e;
        break;
      }
    }
  }

  return last;
}

function getFirstFocusable(element) {
  let first;
  for (const child of element.children) {
    if (child.tabIndex >= 0) {
      first = child;
      break;
    }

    if (child.children.length > 0) {
      const e = getFirstFocusable(child);
      if (e) {
        first = e;
        break;
      }
    }
  }

  return first;
}
