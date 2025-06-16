import { isArrayEqual } from "./utils/array.js";
import { noop } from "./utils/utils.mjs";

/**
 * @typedef {Object} Entry
 * @property {string[]} dataIds
 * @property {Function} onDataChanged
 * @property {string} entryId
 * @property {Function} setData
 */
const entryDefaults = {
  dataIds: [],
  setOnDataChanged: noop,
  onDataChanged: noop,
  entryId: '',
  setData: noop,
  refresh: noop,
  _dataValues: [],
}

const defaults = {
  softComparisons: false,
}

export class LinkedDataMap {
  constructor(settings) {
    settings = {...defaults, ...settings};
    this.dataValueByDataId = {};
    this.entryIdsByDataId = {};
    this.entries = {};
    this.listenerMap = {};
    this.settings = settings;
    this.mutators = {};
    this.mutatorIdsByDataId = {};
    this.prevMutatorId = 0;
  }

  /**
   *
   * @param {string} entryId
   * @param {string[]} dataIds
   * @returns {Entry}
   */
  createEntry(entryId, dataIds) {
    if (!Array.isArray(dataIds)) {
      dataIds = [dataIds];
    }

    const entry = {...entryDefaults};
    entry.dataIds = dataIds;
    this.entries[entryId] = entry;

    for (const dataId of dataIds) {
      const entryIds = this.entryIdsByDataId[dataId] || [];
      entryIds.push(entryId);
      this.entryIdsByDataId[dataId] = entryIds;
    }

    entry.entryId = entryId;

    entry.setOnDataChanged = function(callback) {
      entry.onDataChanged = callback;
      entry.refresh(true);
    }

    entry.setData = (ids, values) => {
      if (!values) {
        values = ids;
        ids = dataIds;
      }

      if (!Array.isArray(values)) {
        values = [values];
      }
      const hasNewData = this.setData(ids, values, entryId);
      entry._dataValues = this._getDataValues(ids);

      if (hasNewData) {
        this._broadcastChange(ids, entryId);
      }
    }

    entry.refresh = (forceRefresh, idOfOrigin) => {
      const newValues = this._getDataValues(entry.dataIds);
      if (forceRefresh || this._isNotEqual(entry._dataValues, newValues)) {
        entry.onDataChanged(newValues, idOfOrigin);
      }
    }

    return entry;
  }

  setMutator(dataIds, callback) {
    if (!Array.isArray(dataIds)) {
      dataIds = [dataIds];
    }

    const mutatorId = this.prevMutatorId += 1;
    for (const dataId of dataIds) {
      const ids = this.mutatorIdsByDataId[dataId] || [];
      ids.push(mutatorId);
      this.mutatorIdsByDataId[dataId] = ids;
    }

    this.mutators[mutatorId] = {
      dataIds: dataIds,
      callback: callback,
    };
  }

  listenTo(dataId, callback) {
    const cbs = this.listenerMap[dataId] || [];
    cbs.push(callback);
    this.listenerMap[dataId] = cbs;
  }

  getDataValue(dataId) {
    return this.dataValueByDataId[dataId];
  }

  setData(dataIds, values, idOfOrigin) {
    let hasNewData = false;

    if (!Array.isArray(dataIds)) {
      dataIds = [dataIds];
    }

    if (!Array.isArray(values)) {
      values = [values];
    }

    const mutatorIds = this._getMutatorIds(dataIds);
    if (mutatorIds.length) {
      hasNewData = this._setData(dataIds, values);
      if (hasNewData) {
        this._applyMutator(mutatorIds, idOfOrigin);
      }
      return hasNewData;
    }

    hasNewData = this._setData(dataIds, values, hasNewData);

    return hasNewData;
  }

  _getMutatorIds(dataIds) {
    let mutatorIds = [];
    for (const dataId of dataIds) {
      const mutatorId = this.mutatorIdsByDataId[dataId];
      if (!mutatorId || mutatorIds.includes(mutatorId)) {
        continue;
      }

      mutatorIds.push(mutatorId);
    }

    return mutatorIds;
  }

  _applyMutator(mutatorIds, idOfOrigin) {
    let values = [];
    for (const mutatorId of mutatorIds) {
      const mutator = this.mutators[mutatorId];
      if (!mutator) {
        continue;
      }
      values = this._getDataValues(mutator.dataIds);
      values = mutator.callback(values, idOfOrigin);

      this._setData(mutator.dataIds, values);
    }
  }

  _getListeners(dataId) {
    return this.listenerMap[dataId] || [];
  }

  _setData(dataIds, values, hasNewData) {
    hasNewData = hasNewData || false;

    for (let i = 0; i < dataIds.length; i++) {
      const isNew = this._setDataValue(dataIds[i], values[i]);

      if (isNew) {
        hasNewData = true;
      }
    }

    return hasNewData;
  }

  _broadcastChange(dataIds, idOfOrigin) {
    const entries = this._getEntries(dataIds);

    for (const entry of entries) {
      if (entry.entryId === idOfOrigin) {
        continue;
      }
      const newValues = this._getDataValues(entry.dataIds);
      entry.refresh(undefined, idOfOrigin);

      entry._dataValues = newValues;
    }

    const values = this._getDataValues(dataIds);
    for (let i = 0; i < dataIds.length; i++) {
      const dataId = dataIds[i];
      const value = values[i];
      const cbs = this._getListeners(dataId);
      for (const cb of cbs) {
        cb(value, idOfOrigin);
      }
    }
  }

  _getEntries(dataIds) {
    let entries = [];
    let included = {};

    for (const dataId of dataIds) {
      const entryIds = this.entryIdsByDataId[dataId];

      for (const entryId of entryIds) {
        if (!included[entryId]) {
          included[entryId] = true;
          entries.push( this.entries[entryId] );
        }
      }
    }

    return entries;
  }

  _setDataValue(dataId, value) {
    const prev = this.dataValueByDataId[dataId];

    if (this._isEqual(prev, value)) {
      return false;
    }

    if (value === undefined) {
      return false;
    }

    this.dataValueByDataId[dataId] = value;
    return true;
  }

  _isNotEqual(valA, valB) {
    return !this._isEqual(valA, valB);
  }

  _isEqual(valA, valB) {
    if (Array.isArray(valA)) {
      return isArrayEqual(valA, valB, (a, b) => this._isEqual(a, b));
    }

    if (this.settings.softComparisons) {
      return valA == valB;
    }

    return valA === valB;
  }

  _getDataValues(dataIds, dataMap) {
    if (!dataMap) {
      dataMap = this.dataValueByDataId;
    }
    let values = [];
    for (const id of dataIds) {
      const value = dataMap[id];
      values.push(value);
    }

    return values;
  }
}
