import { clearElement } from '../utils/utils.mjs';

export const AutoGridDefaults = {
  elementType: 'div',
  autoUpdate: true,
  gridSize: {x: 64, y: 64},
  gridOverflow: 1,
  debug: true,
};

// Unfinished
export function AutoGrid(containerEl, options = AutoGridDefaults) {
  options = {...AutoGridDefaults, ...options};

  const {autoUpdate} = options;

  const states = {
    prev: undefined,
    curr: undefined,
  }
  const state = {
    gridCount: undefined,
  };
  states.curr = state;

  const gridCount = calculateGridCount(countainerEl, options);
  state.gridCount = gridCount;
  populateContainer(containerEl, gridCount, options);

  if (autoUpdate) {
    const resizeObserver = new ResizeObserver((entries) => {
      for (let entry of entries) {
        handleResize(containerEl, entry.target, options, states);
      }
    });

    resizeObserver.observe(containerEl);
  }
}

function handleResize(containerEl, element, options = AutoGridDefaults, states) {
  const newGridCount = calculateGridCount(element, options);
  states.prev = {...states.curr};


  if (states.curr.gridCount != newGridCount) {
    states.curr.gridCount = newGridCount;

    updateContainer(containerEl, options, states);
  }
}

function updateContainer(containerEl, options, states) {
  clearElement(containerEl);

  populateContainer(containerEl, states.curr.gridCount, options);
}

function populateContainer(containerEl, gridCount = {rows: 1, cols: 1}, options = AutoGridDefaults) {
  const {elementType, gridSize} = options;

  for (let row = 0; row < gridCount.rows; row += 1) {
    for (let col = 0; col < gridCount.cols; col += 1) {
      const gridEl = createGridEl(elementType, gridSize);
      const gridPos = {
        x: row * gridSize.x,
        y: col * gridSize.y,
      };

      if (options.debug) {
        gridEl.style.setProperty('background', 'rgba(0, 255, 0, 0.5)');
        gridEl.style.setProperty('border', '1px solid rgb(0, 255, 0)');
      }

      gridEl.style.setProperty('left', `${gridPos.x}px`);
      gridEl.style.setProperty('top', `${gridPos.y}px`);

      containerEl.append(gridEl);
    }
  }
}

function createGridEl(elementType, gridSize) {
  const gridEl = document.createElement(elementType);

  gridEl.style.setProperty('position', 'absolute');
  gridEl.style.setProperty('width', `${gridSize.x}px`);
  gridEl.style.setProperty('height', `${gridSize.y}px`);

  return gridEl;
}

function calculateGridCount(containerEl, options = AutoGridDefaults) {
  const { gridSize, gridOverflow } = options;

  const widthTarget = containerEl.clientWidth;
  const heightTarget = containerEl.clientHeight;

  let rows = (widthTarget / gridSize.x) + gridOverflow * 2;
  let cols = (heightTarget / gridSize.y) + gridOverflow * 2;

  rows = Math.floor(rows) + 1;
  cols = Math.floor(cols) + 1;

  return {rows, cols};
}
