import { nextId } from "../utils/utils.mjs";

export function Identifiable(element) {
  if (!element.hasAttribute('data-primer-id')) {
    const id = `${nextId()}`;

    element.setAttribute('data-primer-id', id);
  }
}
