import { stringToElement } from '../utils/string.js';
import { addEventListener, addMouseListener, getHeight, getWidth } from '../utils/utils.mjs';

export const ResizeableOptions = {
  top: true,
  right: true,
  bottom: true,
  left: true,
  lockAspectRatio: true,
  debug: true,
};

export function Resizeable(element, options) {
  options = {...ResizeableOptions, ...options};

  let hitboxes = [];
  let cleaners = [];
  if (options.top) {
    hitboxes.push(stringToElement(`<div class="resize-hitbox top"></div>`));
  }
  if (options.right) {
    hitboxes.push(stringToElement(`<div class="resize-hitbox right"></div>`));
  }
  if (options.bottom) {
    hitboxes.push(stringToElement(`<div class="resize-hitbox bottom"></div>`));
  }
  if (options.left) {
    hitboxes.push(stringToElement(`<div class="resize-hitbox left"></div>`));
  }
  if (options.top && options.left) {
    hitboxes.push(stringToElement(`<div class="resize-hitbox top-left"></div>`));
  }
  if (options.top && options.right) {
    hitboxes.push(stringToElement(`<div class="resize-hitbox top-right"></div>`));
  }
  if (options.bottom && options.right) {
    hitboxes.push(stringToElement(`<div class="resize-hitbox bottom-right"></div>`));
  }
  if (options.bottom && options.left) {
    hitboxes.push(stringToElement(`<div class="resize-hitbox bottom-left"></div>`));
  }

  for (const hitbox of hitboxes) {
    if (options.debug) {
      hitbox.style.setProperty('background', 'blue');
    }

    addEventListener(hitbox, 'mousedown', () => {

    });
    addMouseListener(hitbox, {
      button: 'left',
      actionType: 'hold',
    }, (event) => {
      const className = hitbox.className;

      // TODO: Make compatible with Rotateable

      let horizontal = false;
      if (className.includes('left') || className.includes('right')) {
        horizontal = true;
      }

      let vertical = false;
      if (className.includes('top') || className.includes('bottom')) {
        vertical = true;
      }

      let width = getWidth(element);
      let height = getHeight(element);
      if (horizontal) {
        let delta = event.movementX;
        if (className.includes('left')) {
          let posX = Number.parseFloat(element.style.getPropertyValue('left')) || 0;
          posX += event.movementX;
          element.style.setProperty('left', `${posX}px`);
          delta = -event.movementX;
        }

        width += delta;
        element.style.setProperty('width', `${width}px`);
      }

      if (vertical) {
        if (className.includes('top')) {
          let posY = Number.parseFloat(element.style.getPropertyValue('top')) || 0;
          posY += event.movementY;
          element.style.setProperty('top', `${posY}px`);
          height -= event.movementY;
        } else {
          height += event.movementY;
        }
        element.style.setProperty('height', `${height}px`);
      }
    });

    element.append(hitbox);
  }

  return () => {
    for (const cleaner of cleaners) {
      cleaner();
    }

    for (const hitbox of hitboxes) {
      element.remove(hitbox);
    }
  }
}

function calcPos(elementPos, mousePos, elementSize) {
  const diff = mousePos - elementPos;
  const perc = diff / elementSize;

  let newVal = elementSize * perc;

  return newVal;
}
