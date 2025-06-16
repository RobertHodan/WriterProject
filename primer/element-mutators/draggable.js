import { addMouseListener, offsetElementBy } from "../utils/utils.mjs";

export const DraggableDefaults = {
  mouseButton: 'left',
  appendListenerTo: undefined,
  forceAbsolute: false,
};

export function Draggable(element, options = DraggableDefaults, callback = ()=>{}) {
  if (typeof(options) === 'function') {
    callback = options;
    options = DraggableDefaults;
  }

  options = {...DraggableDefaults, ...options};
  const { appendListenerTo } = options;

  if (options.forceAbsolute) {
    element.style.setProperty('position', "absolute");
  }

  const listenerElement = appendListenerTo || element;
  const removeListener = addMouseListener(listenerElement, {
    button: options.mouseButton,
  }, (mouseEvent) => {
    let scale = 1;
    const transform = element.style.transform;
    if (transform && transform.includes('scale')) {
      const scaleStr = element.style.transform.split('(')[1].split(')')[0];

      scale = Number.parseFloat(scaleStr);
    }

    callback(mouseEvent);

    offsetElementBy(element, mouseEvent.movementX, mouseEvent.movementY);
  }, element);

  return removeListener;
}
