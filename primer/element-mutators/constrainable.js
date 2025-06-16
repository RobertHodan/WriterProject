import { addMouseListener } from "../utils/utils.mjs";

export const ConstrainableDefaults = {
  mouseButton: 'left',
  appendListenerTo: undefined,
};

export function Constrainable(element, options = ConstrainableDefaults, callback = ()=>{}) {
  if (typeof(options) === 'function') {
    callback = options;
    options = ConstrainableDefaults;
  }

  options = {...ConstrainableDefaults, ...options};
  const { appendListenerTo } = options;

  const listenerElement = appendListenerTo || element;
  const removeListener = addMouseListener(listenerElement, {
    button: options.mouseButton,
  }, (mouseEvent) => {
    const rect = element.getBoundingClientRect();
    callback(mouseEvent);

    element.style.setProperty('left', `${rect.x + mouseEvent.movementX}px`);
    element.style.setProperty('top', `${rect.y + mouseEvent.movementY}px`);
  });

  return removeListener;
}
