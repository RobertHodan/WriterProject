 import { clearElement, wrapAround } from '../utils/utils.mjs';
 import { Component } from './component.mjs';
 import { selectableGroup } from '../component-mutators/selectable-group.js';
import { selectable } from '../component-mutators/selectable.js';

 const defaults = {
   size: 0,
   selectedItem: 0,
 }

  export class Indicator extends Component {
   constructor(settings) {
     settings = {...defaults, ...settings};

     super(settings);

     selectableGroup(this, settings);

     this.items = [];
     this._createIndicators(settings.size);
     this.deselect = () => {};
     if (this.items.length > 0) {
       this.select(settings.selectedItem);
     }
     this.index = settings.selectedItem;
   }

   getItems() {
     return this.items;
   }

   append(item) {
     this.items.push(item);

     if (this.items.length === 1) {
       this.select(0);
     }
   }

   select(index) {
     if (typeof(index) !== 'number') {
       index = this.items.indexOf(index);
     }

     this._select(index);
   }

   removeChildren() {
     super.removeChildren();
     this.items = [];
   }

   setSize(size) {
     this.removeChildren();

     this._createIndicators(size);
   }

   _createIndicators(size) {
     for (let i = 0; i < size; i++) {
       const indicator = new Component({
         className: 'mark',
       });
       selectable(indicator);

       this.items.push(indicator);
       this.el.append(indicator.getElement());
     }
   }
 }
