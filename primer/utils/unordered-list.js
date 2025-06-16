import { stringToElement } from './utils.mjs';

export const UnorderedListDefaults = {
  className: '',
  createItem: () => {},
  listItems: [],
}

export function UnorderedList(options = UnorderedListDefaults) {
  options = {...UnorderedListDefaults, ...options};
  const { className, createItem, listItems } = options;

  const element = stringToElement(`
    <ul>
    </ul>
  `);

  if (className.length > 0) {
    element.className = className;
  }

  for (const data of listItems) {
    const item = createItem(data);

    element.append(item);
  }

  return element;
}
