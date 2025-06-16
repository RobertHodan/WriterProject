import { Component } from '/primer/components/component.mjs';
import { selectable } from '../primer/component-mutators/selectable.mjs';
import { selectableGroup } from '../primer/component-mutators/selectable-group.mjs';
import '../primer/components/text-button.mjs';
import { navigable } from '../nav-ui/mutators/navigable.mjs';
import { NAVACTIONS } from '../nav-ui/nav-actions.mjs';
import { draggable } from '../primer/component-mutators/draggable.mjs';
import { slotable } from '../primer/component-mutators/slotable.mjs';

const defaults = {

}

export class ChapterSidebar extends Component {
  /**
   *
   * @param {ComponentParams} settings
   */
  constructor(settings) {
    settings = { ...defaults, ...settings };
    super(settings);

    selectableGroup(this, {
      wrapAround: settings.wrapAround,
    });

    slotable(this);

    this.isFocused = false;

    this.addEventListener('focusin', () => {
      this.isFocused = true;
    });

    this.addEventListener('focusout', () => {
      this.isFocused = false;
    });
  }

  initialize() {
    super.initialize();

    this.classList.add('sidebar');

    const placeholder = this.createItem({
      textValue: 'Untitled Chapter',
    });
    this.append(placeholder);

    this.selectChild(0);

    navigable(this, {
      bindings: {
        hoverNextChild: NAVACTIONS.DOWN,
        hoverPrevChild: NAVACTIONS.UP,
      }
    });

    this.setAttribute('tabindex', 0);

    if (this.pendingItems) {
      this.setItems(this.pendingItems);
      this.pendingItems = undefined;
    }
  }

  onChapterTitleChanged() {
    console.log("New chapter title!");
  }

  onChapterOrderChanged() {
    console.log("Chapter order changed!");
  }

  canNavigate() {
    return this.isFocused && document.activeElement.tagName != 'INPUT';
  }

  setItems(items) {
    if (!this.isInitialized) {
      this.pendingItems = items;
      return;
    }

    for (const itemSettings of items) {
      const item = this.createItem(itemSettings);
      this.append(item);
    }
  }

  createItem(settings) {
    const textBtn = document.createElement('text-button', settings);
    textBtn.initialize();
    textBtn.classList.add('chapter-list-item');

    const handle = document.createElement('div');
    handle.classList.add('drag-handle');
    draggable(textBtn, {
      handle: handle,
    });

    textBtn.prepend(handle);

    selectable(textBtn);
    navigable(textBtn, {
      bindings: {
        setEditable: NAVACTIONS.ENTER,
      }
    });

    textBtn.setEditable(false);
    textBtn.onSelect = (isSelected) => {
      // textBtn.setEditable(isSelected);
    }

    return textBtn;
  }
}

customElements.define('chapter-sidebar', ChapterSidebar);
