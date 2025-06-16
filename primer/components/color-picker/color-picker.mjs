import { NavButton } from "../../../nav-ui/components/nav-button.mjs";
import { navigable } from "../../../nav-ui/mutators/navigable.mjs";
import { Color, ColorHWB } from "../../color.mjs";
import { Button } from "../button.mjs";
import { Component } from "../component.mjs";
import { ColorSelectionBox } from "./color-selection-box.mjs";
import { ColorSlider, HueSlider, OpacitySlider } from "./color-slider.mjs";
import { NAVACTIONS } from '../../../nav-ui/nav-actions.mjs';
import { ActionBar } from "../../../nav-ui/components/action-bar.mjs";
import { isArray } from "../../utils/utils.mjs";
import { createDynamicIcon } from "../../../nav-ui/dynamic-icon.mjs";

const defaults = {
  className: 'color-picker',
}

export class ColorPicker extends Component {
  constructor(settings) {
    settings = {...defaults, ...settings};
    super(settings);

    const horiz = document.createElement('div');
    horiz.classList.add('horiz');

    this.color = new ColorHWB('hwb(0deg 0% 0%)');
    this.colorSelectionBox = new ColorSelectionBox({
      color: this.color,
    });
    this.append(this.colorSelectionBox.getElement());


    //
    // Hue Slider
    //
    this.hueSlider = new HueSlider({
      className: 'hue-slider',
      color: this.color,
    });
    this.append(this.hueSlider);

    const hueButtons = document.createElement('div');
    hueButtons.classList.add('horiz-center');
    this.hueSlider.append(hueButtons);

    //
    // Hue Keybinds
    //
    navigable(this.hueSlider, {
      bindings: {
        stepUp: NAVACTIONS.NEXTCAT,
        stepDown: NAVACTIONS.PREVCAT,
      },
    });

    const hueBtnPrev = new NavButton({
      className: ['nav-btn', 'prev'],
      navAction: NAVACTIONS.PREVCAT,
      keyboardFocusable: false,
      action: () => this.hueSlider.stepDown(),
    });
    hueButtons.append(hueBtnPrev);

    const hueBtnNext = new NavButton({
      className: ['nav-btn', 'next'],
      navAction: NAVACTIONS.NEXTCAT,
      keyboardFocusable: false,
      action: () => this.hueSlider.stepUp(),
    });
    hueButtons.append(hueBtnNext);


    //
    // Opacity Slider
    //
    this.opacitySlider = new OpacitySlider({
      className: 'opacity-slider',
      color: this.color,
    });
    this.append(this.opacitySlider.getElement());
    const opacityButtons = document.createElement('div');
    opacityButtons.classList.add('horiz-center');
    this.opacitySlider.append(opacityButtons);

    //
    // Opacity Keybinds
    //
    navigable(this.opacitySlider, {
      bindings: {
        stepUp: NAVACTIONS.NEXTTAB,
        stepDown: NAVACTIONS.PREVTAB,
      },
    });

    const opacityBtnPrev = new NavButton({
      className: ['nav-btn', 'prev'],
      navAction: NAVACTIONS.PREVTAB,
      keyboardFocusable: false,
      action: () => this.opacitySlider.stepDown(),
    });
    opacityButtons.append(opacityBtnPrev);

    const opacityBtnNext = new NavButton({
      className: ['nav-btn', 'next'],
      navAction: NAVACTIONS.NEXTTAB,
      keyboardFocusable: false,
      action: () => this.opacitySlider.stepUp(),
    });
    opacityButtons.append(opacityBtnNext);

    //
    // Action Bar
    //
    const actionBar = new ActionBar({
      keyboardFocusable: false,
      createItemElement: (btnSettings) => this.createActionBarItem(btnSettings), 
      btnClassName: 'nav-btn',
      items: [
        {
          label: '@lang:options.accept',
          navAction: NAVACTIONS.ENTER,
        },
        {
          alignRight: true,
          label: '@lang:options.cancel',
          navAction: NAVACTIONS.BACK,
          className: 'margin-left-auto'
        }
      ],
    });
    this.append(actionBar);
  }

  createActionBarItem(btnSettings) {
    let length = 1;
    if (isArray(btnSettings.navAction)) {
      length = btnSettings.navAction.length;
    }

    let button;
    if (length == 4) {
      button = new Button(btnSettings);
      const container = document.createElement('div');
      container.classList.add('directional-btns');

      this.createAndAppendDirectionalIcons(container, btnSettings.navAction);
      button.append(container);
    } else {
      button = new NavButton(btnSettings);
      button.setIconSettings({
        className: 'btn',
      });
    }

    return button;
  }

  createAndAppendDirectionalIcons(container, navActions) {
    const top = createDynamicIcon(navActions[0]);
    container.append(top);

    const horizContainer = document.createElement('div');
    horizContainer.classList.add('horiz');

    const left = createDynamicIcon(navActions[3]);
    horizContainer.append(left);
    const right = createDynamicIcon(navActions[1]);
    horizContainer.append(right);

    container.append(horizContainer);

    const bottom = createDynamicIcon(navActions[2]);
    container.append(bottom);
  }
}