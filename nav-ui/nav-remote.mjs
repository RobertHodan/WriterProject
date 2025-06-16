import { NAVACTIONS } from './nav-actions.mjs';

export class NavRemote {
  /**
   *
   * @param {NavUI} navUI
   */
  constructor(navUI) {
    this.navUI = navUI;
  }

  up() {
    this._callAction(NAVACTIONS.UP);
  }

  down() {
    this._callAction(NAVACTIONS.DOWN);
  }

  left() {
    this._callAction(NAVACTIONS.LEFT);
  }

  right() {
    this._callAction(NAVACTIONS.RIGHT);
  }

  enter() {
    this._callAction(NAVACTIONS.ENTER);
  }

  back() {
    this._callAction(NAVACTIONS.BACK);
  }

  nextCategory() {
    this._callAction(NAVACTIONS.NEXTCAT);
  }

  prevCategory() {
    this._callAction(NAVACTIONS.PREVCAT);
  }

  nextTab() {
    this._callAction(NAVACTIONS.NEXTTAB);
  }

  prevTab() {
    this._callAction(NAVACTIONS.PREVTAB);
  }

  /**
   * @param {string} action
   */
  _callAction(action) {
    this.navUI.performAction(action);
  }
}
