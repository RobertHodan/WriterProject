"use strict";

import { flattenJSONStrings } from "./primer/utils/json.mjs";
import en from "./language/en.mjs";
import { NavUI } from "./nav-ui/nav-ui.mjs";
import { InputManager } from "./primer/managers/input-manager.mjs";
import "./primer/managers/modal-manager.mjs";
import "./ui/chapter-sidebar.mjs";
import "./ui/page-content.mjs";
import "./ui/timeline.mjs";
import { navigable } from "./nav-ui/mutators/navigable.mjs";
import { NAVACTIONS } from "./nav-ui/nav-actions.mjs";

const flat = flattenJSONStrings(en);

const keyboardBindings = {
  'up': ['w', 'arrowDown'],
  'down': ['s', 'arrowUp'],
  'left': 'a',
  'right': 'd',
  'enter': 'enter',
  'back': 'backspace',
  'nextcat': 'e',
  'prevcat': 'q',
  'nexttab': '3',
  'prevtab': '1',
  'scrollup': 'wheelup',
  'scrolldown': 'wheeldown',
  'zoomin': 'ctrl+wheelup',
  'zoomout': 'ctrl+wheeldown',
};

const globalSettings = {
  menuWrapAround: true,
}

const navUI = new NavUI();
const inputManager = new InputManager();

inputManager.setBindings('keyboard', keyboardBindings);
inputManager.inputTypeRefresh();

inputManager.listenToActions((action, isRepeat, strength) => {
  navUI.performAction(action, strength);
});

const sidebar = document.createElement('chapter-sidebar', {
  wrapAround: globalSettings.menuWrapAround,
});

sidebar.setItems([{
  textValue: 'Chapter 1',
},
{
  textValue: 'Chapter 2',
},
{
  textValue: 'Chapter 3',
},
{
  textValue: 'Chapter 4',
},
{
  textValue: 'Chapter 5',
},
{
  textValue: 'Chapter 6',
},
{
  textValue: 'Chapter 7',
}]);

const pageContent = document.createElement('page-content');
pageContent.initialize();

const MODALS = {
  TIMELINE: 'timeline',
};
const modalManager = document.createElement('modal-manager');
modalManager.onShow = function(modalName) {
  navUI.setContext(modalName);
}
modalManager.onHide = function() {
  navUI.undoContext();
}
modalManager.initialize();

const timeline = document.createElement('timeline-component');
timeline.initialize();
modalManager.addModal(MODALS.TIMELINE, timeline, {
  modalClassName: 'timeline-modal',
});

navigable(timeline, {
  contextBindings: {
    zoomIn: NAVACTIONS.ZOOMIN,
    zoomOut: NAVACTIONS.ZOOMOUT,
    scrollUp: NAVACTIONS.SCROLLUP,
    scrollDown: NAVACTIONS.SCROLLDOWN,
  },
  context: MODALS.TIMELINE,
});

//modalManager.showModal(MODALS.TIMELINE);

document.body.append(sidebar);
document.body.append(pageContent);

document.body.append(modalManager);

