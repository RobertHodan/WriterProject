// Flatten a JSON object comprised exclusively of strings
export function flattenJSONStrings(json, path, map = {}) {
  const keys = Object.keys(json);

  for (const key of keys) {
    let newPath = path || '';
    if (path) {
      newPath += '.';
    }
    newPath += key;

    if (typeof(json[key]) == 'string') {
      map[newPath] = json[key];
    } else {
      map = flattenJSONStrings(json[key], newPath, map);
    }
  }

  return map;
}
