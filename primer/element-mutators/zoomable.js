import { addEventListener } from "../utils/utils.mjs";

export const ZoomableDefaults = {
  mouseButton: 'left',
  scale: 1,
  appendListenerTo: undefined,
};

export function Zoomable(element, options = ZoomableDefaults, callback = ()=>{}) {
  if (typeof(options) === 'function') {
    callback = options;
    options = ZoomableDefaults;
  }

  options = {...ZoomableDefaults, ...options};
  const { appendListenerTo } = options;

  const listenerElement = appendListenerTo || element;
  let scale = options.scale;
  const removeListener = addEventListener(listenerElement, 'wheel', (event) => {
    const isUp = event.deltaY > 0;
    const i = 0.1;
    scale += isUp ? -i : i;

    callback(event, scale);
  });

  return removeListener;
}
