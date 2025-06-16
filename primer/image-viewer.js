import { stringToElement, linkCSS } from './utils/utils.mjs';
import { Primer, PrimerDefaults } from './primer.js';
import { ArrowIcon } from '../icons/icons.js';
import { UnorderedList } from './utils/unordered-list.js';
import { focusTrap } from './focus-trap.js';
import { Draggable } from './element-mutators/draggable.js';
import { Zoomable } from './element-mutators/zoomable.js';

linkCSS('/primer/image-viewer.css');

export const ImageViewerDefaults = {
  ...PrimerDefaults,
  flex: false,
  /*
    number,
    string: css, 'largest', 'average'
    undefined,
  */
  height: 'largest',
  imageLinks: [],
  element: undefined,
}

export class ImageViewer extends Primer {
  constructor(options = ImageViewerDefaults) {
    options = {...ImageViewerDefaults, ...options};

    super(options);
    this.element = options.element || stringToElement(`
      <div class="image-viewer"></div>
    `);

    this.container = stringToElement(`
      <div class="container">
        <div class="background"></div>
        <div class="image-container"></div>
        <button class="prev nav-btn">${ArrowIcon()}</button>
        <button class="next nav-btn">${ArrowIcon()}</button>
      </div>
    `);
    this.element.append(this.container);

    this.nextBtn = this.element.getElementsByClassName('next')[0];
    this.prevBtn = this.element.getElementsByClassName('prev')[0];
    this.imageContainer = this.element.getElementsByClassName('image-container')[0];

    // Create Images
    const images = this._createImages(options.imageLinks);
    for (const image of images) {
      this.imageContainer.append(image);

      // Bandaid fix
      if (options.flex && images.length === 2) {
        image.style.setProperty('width', '50%');
      }
    }

    // Update image count
    this.images = this.element.getElementsByTagName('img');
    this.numOfImages = this.images.length;
    this.scale = 1;

    this._enableNavigationEvents();

    this.onload = () => {};
    this.addEventListener(window, 'load', () => {
      this.onload();
    });

    this._createImageIndicator(options.imageLinks);

    this.state = {
      selectedIndex: 0,
    };

    this.view();
    this.applyOptions();
  }

  setScale(scale) {
    if (scale < 0.1) {
      scale = 0.1;
    }

    this.imageContainer.style.setProperty('transform', `scale(${scale})`);
  }

  applyOptions() {
    super.applyOptions();

    if (this.options.flex) {
      this.element.classList.add('flex');
    } else {
      this.element.classList.add('default');
    }

    if (this.options.height) {
      this._setHeight(this.options.height);
    }
  }

  view(index = 0) {
    const img = this.element.getElementsByTagName('img')[index];

    if (this.hidePrevious) {
      this.hidePrevious();
    }

    if (img) {
      this.hidePrevious = showImage(img);
    }

    // Update indicator
    const item = this.imageIndicator.getElementsByTagName('li')[index];
    if (this.unselectIndicator) {
      this.unselectIndicator();
    }

    item.classList.add('selected');
    this.unselectIndicator = () => {
      item.classList.remove('selected');
    };
  }

  toggleExpandFullPage(expand) {
    if (expand === undefined) {
      expand = !this.container.hasAttribute('role');
    }

    if (expand) {
      this.show();
    } else {
      this.hide();
    }
  }

  isOpen() {
    const role = this.container.getAttribute('role');

    if (!role) {
      return false;
    }

    return role === 'dialog';
  }

  show() {
    this.element.style.setProperty('height', `${this.element.clientHeight}px`);

    this.container.setAttribute('role', 'dialog');
    this.nextBtn.focus();
    document.body.style.setProperty('overflow', 'hidden');

    if (!this.untrap) {
      this.untrap = focusTrap(this.container);
    }

    this._enableImageDragging();
    this._enableImageZooming();

    document.body.style.setProperty('user-select', 'none');
  }

  hide() {
    this.container.removeAttribute('role');
    this.setScale(1);
    document.body.style.removeProperty('overflow');

    if (this.untrap) {
      this.untrap();
      this.untrap = undefined;
    }

    this._disableImageDragging();
    this._disableImageZooming();

    this.imageContainer.style.removeProperty('left');
    this.imageContainer.style.removeProperty('top');

    document.body.style.removeProperty('user-select');

    this.element.style.removeProperty('height');
  }

  _createImages(imageLinks) {
    const images = [];
    for (const link of imageLinks) {
      images.push(stringToElement(`
        <img src=${link}>
      `));
    }

    return images;
  }

  _createImageIndicator(imageLinks) {
    // Image Indicator
    let i = 0;
    this.imageIndicator = UnorderedList(imageLinks, (link) => {
      const item = stringToElement(`
        <li></li>
      `);

      const myIndex = i;
      item.addEventListener('click', () => {
        this.view(myIndex);
      });
      i += 1;

      return item;
    }, {className: 'image-indicator'});

    this.container.append(this.imageIndicator);
  }

  _setHeight(height) {
    if (this._isAuto(height)) {
      // Will call setHeight again later, when document is loaded
      this.onload = () => {
        this._setAutoHeight(height);
      }
      return;
    }

    let cssHeight;
    if (height === 'string') {
      cssHeight = height;
    } else if (Number.isFinite(height)) {
      cssHeight = `${height}px`;
    }

    if (cssHeight && !this.element.style.hasOwnProperty('height')) {
      this.element.style.setProperty('height', cssHeight);
    }

    const imageContainerRect = this.imageContainer.getBoundingClientRect();
    const containerHeight = (height > imageContainerRect.height) ? imageContainerRect.height : height;
    this.imageContainer.style.setProperty('height', `${containerHeight}px`);
  }

  _isAuto(height) {
    if (
      height === 'largest' ||
      height === 'average'
    ) {
      return true;
    }

    return false;
  }

  // use the largest image
  _setAutoHeight(height) {
    const heights = getImageHeights(this.images);

    let newHeight;
    if (height === 'largest') {
      newHeight = heights[heights.length-1];
    } else if (height === 'average') {
      let sum = 0;
      for (const height of heights) {
        sum += height;
      }

      newHeight = sum / heights.length;
    }

    this._setHeight(newHeight);
  }

  _enableImageDragging() {
    // Image Dragging
    this.isContainerDragging = false;
    this._disableImageDragging = Draggable(this.imageContainer, {
      appendListenerTo: this.container,
    }, (event) => {
      this.isContainerDragging = true;

      if (event.movementX === 0 && event.movementY === 0) {
        this.isContainerDragging = false;
      }
    });

    this.addEventListener(window, 'mouseup', () => {
      setTimeout(() => {
        this.isContainerDragging = false;
      }, 0);
    });
  }

  _enableImageZooming() {
    this._disableImageZooming = Zoomable(this.imageContainer, {
      appendListenerTo: this.container,
    }, (event, scale) => {
      this.setScale(scale);
    });
  }

  _isInteractible(target) {
    if (target === this.prevBtn || target === this.nextBtn) {
      return true;
    }

    if (target.parentElement === this.imageIndicator) {
      return true;
    }

    return false;
  }

  _enableNavigationEvents() {
    // Image Navigation
    this.addEventListener(this.nextBtn, 'click', () => {
      if (this.isContainerDragging) {
        return;
      }

      this.state.selectedIndex += 1;
      if (this.state.selectedIndex >= this.numOfImages) {
        this.state.selectedIndex = 0;
      }

      this.view(this.state.selectedIndex);
    });

    this.addEventListener(this.prevBtn, 'click', () => {
      if (this.isContainerDragging) {
        return;
      }

      this.state.selectedIndex -= 1;
      if (this.state.selectedIndex < 0) {
        this.state.selectedIndex = this.numOfImages - 1;
      }

      this.view(this.state.selectedIndex);
    });

    // Expand to full page
    this.addEventListener(this.container, 'click', (event) => {
      const { target } = event;
      if (this._isInteractible(target)) {
        return;
      }

      if (!this.isContainerDragging) {
        this.toggleExpandFullPage();
      }
    });

    this.addEventListener(this.element, 'keydown', (event) => {
      if (event.key === 'Escape') {
        this.toggleExpandFullPage(false);
      }
    });
  }
}

function getImageHeights(images) {
  const sizes = [];

  for (const img of images) {
    sizes.push(img.naturalHeight);
  }

  sizes.sort((a, b) => {
    return a - b;
  });

  return sizes;
}

function showImage(img) {
  img.classList.add('selected');

  return () => {
    img.classList.remove('selected');
  };
}
