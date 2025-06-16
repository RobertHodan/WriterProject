import { Component } from './component.mjs';
import './button.mjs';
import './textfield.mjs';

const defaults = {
}

export class TextButton extends Component {
  /**
   *
   * @param {ComponentParams} settings
   */
  constructor(settings) {
    settings = { ...defaults, ...settings };

    super(settings);
  }

  initialize() {
    super.initialize();
    this.classList.add('text-button');

    if (this.settings.textValue) {
      this.setAttribute('value', this.settings.textValue);
    }

    const textField = document.createElement('text-field', {
      textValue: this.settings.textValue,
    });
    textField.initialize();
    textField.classList.add('item-input');

    const editBtn = document.createElement('button-component', {
      content: 'edit',
    });
    editBtn.initialize();
    textField.classList.add('edit-btn');

    editBtn.setAction(() => {
      this.setEditable(true);

      // "Focus" the TextField next frame, otherwise
      // the mouse event will immediately steal it back
      setTimeout(() => {
        textField.focus();
      }, 0);

      textField.addEventListener('blur', () => {
        this.setEditable(false);
      });
    });

    this.append(textField);
    this.append(editBtn);
  }

  isEditable(item) {
    const input = this.getItemInput(item);

    return input.hasAttribute('disabled');
  }

  setEditable(isEditable) {
    const input = this.getItemInput();
    if (isEditable == undefined) {
      isEditable = !this.isEditable();
    }

    if (isEditable) {
      input.removeAttribute('disabled');
    } else {
      input.setAttribute('disabled', '');
    }
  }

  getItemInput() {
    return this.getElementsByClassName('item-input')[0];
  }
}
customElements.define('text-button', TextButton);
