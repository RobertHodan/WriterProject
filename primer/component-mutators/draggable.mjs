import { addMutator, isNotComponent } from './utils.mjs';
import { addMouseListener } from '../utils/utils.mjs';
import { getGlobalSlotData } from './slotable.mjs';

const requisites = {
  dragBegin: function () {
    const element = this;
    const parent = element.parentElement;

    if (!parent) {
      return;
    }

    const globalSlotData = getGlobalSlotData();
    if (globalSlotData.isDragging) {
      return;
    }

    globalSlotData.isDragging = true;
    const rect = element.getBoundingClientRect();
    const styles = window.getComputedStyle(element);
    const font = styles['font'];

    // Replace real element with an invisible clone
    // A deep clone is done to preserve the dimension resulting from children
    const standin = element.cloneNode(true);
    standin.style.setProperty('visibility', 'hidden');
    element.replaceWith(standin);
    globalSlotData.setSlotClone(standin);
    globalSlotData.setElement(element);

    const hoverCopy = element.cloneNode(true);
    hoverCopy.style.setProperty('width', `${rect.width}px`);
    hoverCopy.style.setProperty('height', `${rect.height}px`);
    hoverCopy.style.setProperty('position', `absolute`);
    hoverCopy.style.setProperty('left', `${rect.x}px`);
    hoverCopy.style.setProperty('top', `${rect.y}px`);
    hoverCopy.style.setProperty('font', font);
    hoverCopy.style.setProperty('pointer-events', 'none');

    document.body.append(hoverCopy);

    const settings = this.dragcomp;

    settings._hoverPreview = hoverCopy;

    this.dragUpdate({
      movementX: 0,
      movementY: 0,
    });
  },
  dragUpdate: function (event) {
    const hoverPreview = this.dragcomp._hoverPreview;

    if (!hoverPreview) {
      return;
    }

    const bounds = hoverPreview.getBoundingClientRect();

    hoverPreview.style.setProperty('left', `${bounds.x + event.movementX}px`);
    hoverPreview.style.setProperty('top', `${bounds.y + event.movementY}px`);

    const globalSlotData = getGlobalSlotData();
    globalSlotData.onDragElement(bounds);
  },
  dragStop: function () {
    const globalSlotData = getGlobalSlotData();
    globalSlotData.isDragging = false;
    const hoverPreview = this.dragcomp._hoverPreview;

    if (hoverPreview) {
      hoverPreview.remove();
      this.dragcomp._hoverPreview = undefined;
    }

    const {
      slotClone,
      element,
    } = globalSlotData;

    if (slotClone) {
      slotClone.replaceWith(element);
      globalSlotData.setSlotClone(undefined);
      globalSlotData.setElement(undefined);
      globalSlotData.onDragCancel();
    }
  },
}

const internals = {
  id: 'dragcomp',
  handle: undefined, // Element
  _hoverPreview: undefined, // Element
};

export function draggable(component, settings) {
  if (component.isDraggable) {
    return;
  }

  component.isDraggable = true;

  addMutator(component, internals, requisites, settings);

  if (!component.dragcomp.handle) {
    component.dragcomp.handle = component;
  }

  const removeMouseListener = addMouseListener(component.dragcomp.handle, {
    onMouseMove: (event) => {
      component.dragUpdate(event);
    },
    onMouseUp: () => {
      component.dragStop();
      document.body.style.setProperty('user-select', 'inherit');
    },
    onMouseDown: () => {
      component.dragBegin();
      document.body.style.setProperty('user-select', 'none');
    }
  })
}

export function isDraggable(component) {
  if (isNotComponent(component)) {
    return false;
  }

  return component.isDraggable;
}
