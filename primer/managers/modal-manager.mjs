import { isComponent } from '../component-mutators/utils.mjs';
import { Component } from '../components/component.mjs';
import { focusTrap } from '../focus-trap.mjs';
import { clearElement, isString, noop } from '../utils/utils.mjs';

/**
 * @typedef {Object} ComponentParams
 * @property {Function?} action
 * @property {boolean?} keyboardFocusable
 * @property {Array<Array<TemplateObject>} template
 */

/**
 * @typedef {Object} TemplateObject
 * @property {HTMLElement} content
 * @property {string} action
 */

const defaults = {
  action: noop,
  onValueUpdated: noop,
  onShow: noop,
  onHide: noop,
  keyboardFocusable: true,
  footer: undefined,
  header: undefined,
  className: 'modal-manager'
}

const modalDefaults = {
  modalClassName: undefined, // String
  overrideModalClass: false,
}

export class ModalManager extends Component {
  /**
   *
   * @param {ComponentParams} settings
   */
  constructor(settings) {
    settings = { ...defaults, ...settings };
    super(settings);

    this.modals = {};
    this.modalOptions = {};

    this.modalCloseCb = noop;
    this.activeId = '';

    this.onShow = settings.onShow;
    this.onHide = settings.onHide;

    this.disableFocusTrap = noop;
  }

  initialize() {
    super.initialize();

    this.container = document.createElement('div');
    this.container.classList.add('modal-container');
    this.append(this.container);

    this.header = document.createElement('div');
    this.header.classList.add('modal-header');
    this.container.append(this.header);

    this.content = document.createElement('div');
    this.content.classList.add('modal-content');
    this.container.append(this.content);

    this.footer = document.createElement('div');
    this.footer.classList.add('modal-footer');
    this.container.append(this.footer);

    if (this.settings.footer) {
      this.setFooter(this.settings.footer);
    }

    if (this.settings.header) {
      this.header.append(this.settings.header);
    }

    this.addEventListener('click', (e) => {
      if (e.target === this) {
        this.cancel();
      }
    });

    this._hide();
  }

  setClassName(className, overrideDefault) {
    if (overrideDefault) {
      this.classList.remove(...this.classList.values());
    }

    this.classList.add(className);
  }

  revertClassName() {
    this.setClassName(this.settings.className, true);
  }

  setFooter(footer) {
    clearElement(this.footer);
    this.footer.append(footer);
  }

  addModal(id, modal, options) {
    if (isString(options)) {
      options = {
        modalClassName: options,
      }
    }
    options = { ...modalDefaults, ...options };

    this.modals[id] = modal;
    this.modalOptions[id] = options;
  }

  cancel() {
    this._hide(false);
  }

  submit() {
    this._hide(true);
  }

  _hide(isSuccess) {
    const modal = this.modals[this.activeId];

    this.disableFocusTrap();
    this.disableFocusTrap = noop;
    this.activeId = undefined;

    this.container.remove();
    this.revertClassName();
    this.classList.add('hidden');

    this.onHide(this.activeId);

    if (!modal) {
      return;
    }

    modal.remove();
    this.modalCloseCb(modalValue(), isSuccess);
  }

  showModal(id, onClose) {
    if (this.activeId === id) {
      return;
    }

    const modal = this.modals[id];

    if (!modal) {
      return;
    }

    // Call onhide if another modal is already active
    if (this.activeId && this.activeId.length) {
      this.onHide(this.activeId);
    }

    this.append(this.container);
    this.classList.remove('hidden');

    this.onShow(id);

    this._appendModal(modal);

    this.disableFocusTrap = focusTrap(this.container);

    this.modalCloseCb = onClose || noop;
    this.activeId = id;

    const options = this.modalOptions[id];
    this.revertClassName();
    if (options.modalClassName) {
      this.setClassName(options.modalClassName, options.overrideModalClass);
    }
  }

  _appendModal(modal) {
    this.content.append(modal);

    if (this.activeId) {
      const activeModal = this.modals[this.activeId];
      if (activeModal) {
        activeModal.remove();
      }
    }
  }
}

customElements.define('modal-manager', ModalManager);
