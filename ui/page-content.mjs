import { Component } from '/primer/components/component.mjs';

const defaults = {
  // action: noop,
}

export class PageContent extends Component {
  constructor(settings) {
    settings = { ...defaults, ...settings };
    super(settings);
  }

  initialize() {
    this.classList.add('page-content');
    this.setAttribute('contenteditable', '');
  }
}
customElements.define('page-content', PageContent);
