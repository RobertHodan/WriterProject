import { getComponent, isComponent } from "../component-mutators/utils.mjs";
import { isFunction, isNotValid, isValid } from "../utils/utils.mjs";

// function destroyAll() {
//   for (const child of document.body.children) {
//     child.destroy && child.destroy();
//   }
// }

// window.addEventListener('beforeunload', (e) => {
//   destroyAll();
// });

// function callOnAddedToDOM(element) {
//   if (isNotValid(element)) {
//     return;
//   }
  
//   const component = getComponent(element);
//   if (component && component.onAddedToDOM) {
//     component.onAddedToDOM();
//   }

//   if (element.children && element.children.length) {
//     for (const child of element.children) {
//       callOnAddedToDOM(child);
//     }
//   }
// }

// const append = Element.prototype.append;
// Element.prototype.append = function(el) {
//   if (el.isComponent) {
//     el.onAddedToDOM();
//   }

//   if (el) {
//     append.call(this, el);
//   }
// }

// const remove = Element.prototype.remove;
// Element.prototype.remove = function() {
//   if (isFunction(this.onBeforeRemoved)) {
//     this.onBeforeRemoved();
//   }

//   remove.call(this);

//   const component = getComponent(this);
//   if (component) {
//     component.onRemoved();
//   }
// }

// Element.prototype.destroy = function() {
//   this.remove();

//   for (const child of this.children) {
//     child.destroy();
//   }

//   const component = getComponent(this);
//   if (component) {
//     component.destroy();
//   }
// }

