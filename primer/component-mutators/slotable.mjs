import { addMutator, isNotComponent } from './utils.mjs';

const requisites = {
}

const internals = {
  id: 'slotable',
}

const GlobalSlotData = {
  slotClone: undefined,
  element: undefined,
  isDragging: false,
  _dragEl: undefined,
  _prevElPoint: undefined,
  _activeSlotable: undefined,
  setSlotClone: function (element) {
    this.slotClone = element;
  },
  setElement: function (element) {
    this.element = element;
  },
  onDragElement: function (bounds) {
    if (!this.slotClone) {
      this._dragEl = undefined;
      this._activeSlotable = undefined;
      return;
    }

    const x = bounds.x + bounds.width / 2;
    const y = bounds.y + bounds.height / 2;
    const el = document.elementFromPoint(x, y);

    if (!el) {
      this._dragEl = undefined;
      this._activeSlotable = undefined;
    }

    if (this._prevElPoint != el) {
      this._prevElPoint = el;
      const [activeSlotable, child] = this.getSlotableAncestor(el);
      if (!activeSlotable) {
        this._activeSlotable = undefined;
        this._dragEl = undefined;
        return;
      }
      if (!child) {
        this._dragEl = undefined;
        return;
      }
      if (activeSlotable != this._activeSlotable) {
        this._activeSlotable = activeSlotable;
        activeSlotable.focus();
      }

      this._activeSlotable = activeSlotable;
      this._dragEl = child;
    }

    if (!this._dragEl) {
      return;
    }

    const childRect = this._dragEl.getBoundingClientRect();
    const isColumn = this.isColumnLayout(this._activeSlotable);
    let shouldInsertAfter = false;
    if (isColumn) {
      shouldInsertAfter = y >= (childRect.y + childRect.height / 2);
    } else {
      shouldInsertAfter = x >= (childRect.x + childRect.width / 2);
    }

    if (shouldInsertAfter) {
      this._activeSlotable.insertBefore(this.slotClone, this._dragEl.nextSibling);
    } else {
      this._activeSlotable.insertBefore(this.slotClone, this._dragEl)
    }
  },
  isColumnLayout: function (element) {
    // Assumes flexbox is used for every single slotable component.
    return window.getComputedStyle(element).flexDirection == 'column';
  },
  onDragCancel: function () {
    this._prevElPoint = undefined;
    this._activeSlotable = undefined;
    this._dragEl = undefined;
  },
  getSlotableAncestor: function (child) {
    if (!child) {
      return [undefined, undefined];
    }

    const parent = child.parentElement;
    if (!parent) {
      return [undefined, undefined];
    }

    if (isSlotable(parent)) {
      return [parent, child];
    }

    return this.getSlotableAncestor(parent);
  },
}

export function getGlobalSlotData() {
  return GlobalSlotData;
}

export function slotable(component, settings) {
  if (component.isSlotable) {
    return;
  }

  component.isSlotable = true;

  addMutator(component, internals, requisites, settings);
}

export function isSlotable(component) {
  if (isNotComponent(component)) {
    return false;
  }

  return component.isSlotable;
}
