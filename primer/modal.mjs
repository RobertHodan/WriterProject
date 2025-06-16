import { stringToElement } from './utils/string.mjs';
import { focusTrap } from './focus-trap.mjs';
import { Component } from './components/component.mjs';

export const ModalDefaults = {
  startOpen: false,
  disableDefaultEvents: true,
}

export class Modal extends Component {
  constructor(options = ModalDefaults) {
    options = {...ModalDefaults, ...options};

    super(options);
    this.el = stringToElement(`
      <div class="modal">
        <dialog></dialog>
        <div class="background"></div>
      </div>
    `);

    this.dialog = this.el.getElementsByTagName('dialog')[0];
    if (options.className) {
      this.dialog.classList.add(options.className);
    }

    const background = this.el.getElementsByClassName('background')[0];
    this.canScroll = true;

    if (!options.disableDefaultEvents) {
      this.addEventListener(window, 'keydown', (event) => {
        if (event.key === 'Escape') {
          this.hide();
        }
      });
      this.addEventListener(background, 'click', () => {
        this.hide();
      });
    }

    if (options.content  && options.content !== document.body) {
      this.dialog.append(options.content);
    }

    this.untrap;
    this.eventRemovers.push(() => {
      if (this.untrap) {
        this.untrap();
      }
    });

    if (options.startOpen) {
      this.show();
    } else {
      this.hide();
    }
  }

  append(element) {
    if (element.isComponent) {
      element = element.getElement();
    }
    this.dialog.append(element);
  }

  show() {
    if (this.dialog.show) {
      this.dialog.show();
    } else {
      this.dialog.setAttribute('open', true);
    }

    if (this.el.classList.contains('hidden')) {
      this.el.classList.remove('hidden');
    }

    this.bodyOverflow = "overflow";
    document.body.style.setProperty('overflow', 'hidden');

    if (!this.untrap) {
      this.untrap = focusTrap(this.dialog);
    }
  }

  hide() {
    if (this.dialog.close) {
      this.dialog.close();
    } else {
      this.dialog.removeAttribute('close');
    }

    if (!this.el.classList.contains('hidden')) {
      this.el.classList.add('hidden');
    }

    document.body.style.removeProperty('overflow');

    if (this.untrap) {
      this.untrap();
      this.untrap = undefined;
    }
  }
}
