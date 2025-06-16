import { clamp, clearElement, isDate, isNotNumber, noop } from '../primer/utils/utils.mjs';
import { Component } from '/primer/components/component.mjs';

const defaults = {
  // action: noop,
  className: 'timeline',
}

const monthNames = {
  0: 'January',
  1: 'February',
  2: 'March',
  3: 'April',
  4: 'May',
  5: 'June',
  6: 'July',
  7: 'August',
  8: 'September',
  9: 'October',
  10: 'November',
  11: 'December',
};

const dayNames = {
  0: 'Saturday',
  1: 'Sunday',
  2: 'Monday',
  3: 'Tuesday',
  4: 'Wednesday',
  5: 'Thursday',
  6: 'Friday'
};

const TIMESCALE = {
  DAY: 'day',
  MONTH: 'month',
  YEAR: 'year',
};

export class Timeline extends Component {
  constructor(settings) {
    settings = { ...defaults, ...settings };

    settings.tagName = 'div';
    super(settings);

    this.targetDate = new Date();
    this.targetDate.setUTCMonth(1);
    this.targetDate.setUTCDate(26);

    this.dateWidthDefault = 200;
    this.dateWidth = this.dateWidthDefault;
    this.dateMin = 100;
    this.dateMax = 1000;
    this.zoomStep = 10;

    this.datesMargin = this.dateWidth * -1;
    this.firstMonth;

    this.timescale = TIMESCALE.MONTH;
  }

  initialize() {
    super.initialize();
    const year = document.createElement('div');
    year.classList.add('years');

    const month = document.createElement('div');
    month.classList.add('months');

    const dates = document.createElement('div');
    dates.classList.add('dates');

    this.append(year);
    this.append(month);
    this.append(dates);
  }

  onRender() {
    super.onRender();

    if (!this.firstRender) {
      this.firstRender = true;

      this.updateAllElements(this.targetDate);
      this.updateTimescale(this.timescale);
      // const el = this;
      // const firstDate = el.getElementsByClassName('date')[0];
      // this.centerDate(el.getElementsByClassName('dates')[0].firstChild);
      // this.reshiftChildren();
    }
  }

  zoomIn(strength = 1) {
    this.zoom(strength);
  }

  zoomOut(strength = 1) {
    this.zoom(strength * -1);
  }

  zoom(delta) {
    this.dateWidth += delta;
    this.updateTimescale();

    this.dateWidth = clamp(this.dateWidth, this.dateMin, this.dateMax);
    const el = this;
    const datesEl = el.getElementsByClassName('dates')[0];
    const center = this.getCenterItemByTimescale(this.timescale);
    const centerRect = center.getBoundingClientRect();

    datesEl.style.setProperty('width', `${datesEl.children.length * this.dateWidth}px`);

    const monthEls = el.getElementsByClassName('month');
    for (const monthEl of monthEls) {
      this.refreshMonthEl(monthEl);
    }

    this.refreshNumOfChildren(true);
    this.centerDate(center, centerRect.x + centerRect.width / 2);
    this.reshiftChildren();
  }

  reshiftChildren() {
    const el = this;
    const datesEl = el.getElementsByClassName('dates')[0];
    const firstRect = datesEl.firstChild.getBoundingClientRect();
    const lastRect = datesEl.lastChild.getBoundingClientRect();

    if (firstRect.x >= 0) {
      const numNew = Math.ceil(firstRect.x / this.dateWidth);
      for (let i = 0; i < numNew; i++) {
        const firstDate = datesEl.firstChild.date;
        const year = firstDate.getUTCFullYear();
        const month = firstDate.getUTCMonth();
        const date = firstDate.getUTCDate();
        const newDate = this.createDate(year, month, date - 1);

        this.updateDateEl(datesEl.lastChild, newDate);
        this.datesMargin -= this.dateWidth;

        datesEl.prepend(datesEl.lastChild);
      }
    }
    else if (lastRect.x + lastRect.width <= window.innerWidth) {
      const numNew = Math.ceil((window.innerWidth - lastRect.x - lastRect.width) / this.dateWidth);
      for (let i = 0; i < numNew; i++) {
        const lastDate = datesEl.lastChild.date;
        const year = lastDate.getUTCFullYear();
        const month = lastDate.getUTCMonth();
        const date = lastDate.getUTCDate();
        const newDate = this.createDate(year, month, date + 1);

        this.updateDateEl(datesEl.firstChild, newDate);
        this.datesMargin += this.dateWidth;

        datesEl.append(datesEl.firstChild);
      }
    }

    // this.refreshMargin();
  }

  updateTimescale() {
    if (this.dateWidth <= this.dateMin) {
      if (this.timescale == TIMESCALE.DAY) {
        this.timescale = TIMESCALE.MONTH;
      } else if (this.timescale == TIMESCALE.MONTH) {
        // this.timescale = TIMESCALE.YEAR;
      }
    }
    else if (this.dateWidth >= this.dateMax) {
      if (this.timescale == TIMESCALE.YEAR) {
        this.timescale = TIMESCALE.MONTH;
      } else if (this.timescale == TIMESCALE.MONTH) {
        this.timescale = TIMESCALE.DAY;
      }
    }

    if (this.timescale != this.prevTimescale) {
      const el = this;
      if (this.timescale == TIMESCALE.MONTH) {
        const firstMonth = el.getElementsByClassName('month')[0];
        this.dateWidth = firstMonth.getBoundingClientRect().width;
      }
      else if (this.timescale == TIMESCALE.DAY) {
        const centerMonth = this.getCenterItemByTimescale(TIMESCALE.MONTH);
        const daysInMonth = centerMonth.daysInMonth;


      }

      const center = this.getCenterItemByTimescale(TIMESCALE.DAY);
      if (!center) {
        return;
      }

      this.updateElementData(center.date);
      // this.dateWidth = this.dateWidthDefault;
      this.prevTimescale = this.timescale;
      this.setTimescaleClassName(this.timescale);
    }
  }

  scrollUp(strength = 1) {
    this.scroll(strength);
  }

  scrollDown(strength = 1) {
    this.scroll(strength * -1);
  }

  updateCenteredItem() {
    const centered = this.getCenterItemByTimescale(this.timescale);

    if (centered && centered != this.centeredItem) {
      this.centeredItem = centered;
    }
  }

  getCenterItemByTimescale(timescale) {
    const el = this;
    let container;
    if (timescale == TIMESCALE.DAY) {
      container = el.getElementsByClassName('dates')[0];
    }
    else if (timescale == TIMESCALE.MONTH) {
      container = el.getElementsByClassName('months')[0];
    }
    else if (timescale == TIMESCALE.YEAR) {
      container = el.getElementsByClassName('years')[0];
    }

    const centered = this._findCenteredItem(container);

    return centered;
  }

  _findCenteredItem(container, index) {
    const children = container.children;
    if (!index) {
      index = Math.floor(children.length / 2);
    }

    let i = index;
    let child;
    let childRect;
    const windowCenter = window.innerWidth / 2;
    let isWithinCenter;
    while (i >= 0 || i < children.length) {
      child = children[i];
      if (!child) {
        break;
      }
      childRect = child.getBoundingClientRect();

      isWithinCenter = childRect.x <= windowCenter &&
        childRect.x + childRect.width >= windowCenter;

      if (isWithinCenter) {
        break;
      }

      childRect = child.getBoundingClientRect();

      if (childRect.x < windowCenter) {
        i++;
      } else {
        i--;
      }
    }

    if (isWithinCenter) {
      return child;
    }

    return undefined;
  }

  refreshMargin(timescale) {
    const el = this;

    // Days
    const dates = el.getElementsByClassName('dates')[0];
    if (!timescale || timescale == TIMESCALE.DAY) {
      dates.style.setProperty('margin-left', `${this.datesMargin}px`);
    }

    // Months
    const months = el.getElementsByClassName('months')[0];
    let monthsMargin = (dates.firstChild.date.getUTCDate() - 1) * this.dateWidth * -1 + this.datesMargin;
    if (!timescale || timescale == TIMESCALE.MONTH) {
      if (this.timescale == TIMESCALE.MONTH) {
        monthsMargin = this.datesMargin;
      }

      months.style.setProperty('margin-left', `${monthsMargin}px`);
    }

    // Years
    if (!timescale || timescale == TIMESCALE.YEAR) {
      let firstMonth;
      let yearsMargin;
      const yearsEl = el.getElementsByClassName('years')[0];

      if (this.timescale == TIMESCALE.YEAR) {
        firstMonth = dates.firstChild.date;
      } else {
        firstMonth = months.firstChild.date
        yearsMargin = monthsMargin;
      }

      if (firstMonth.getUTCMonth() > 0) {
        let days;
        if (this.timescale == TIMESCALE.DAY) {
          const prevMonth = this.createDate(firstMonth.getUTCFullYear(), firstMonth.getUTCMonth(), 0);
          days = this.getElapsedDaysInYear(prevMonth);
        }
        else if (this.timescale == TIMESCALE.MONTH) {
          days = firstMonth.getUTCMonth();
        }
        yearsMargin -= days * this.dateWidth;
      } else {
        yearsMargin = this.datesMargin;
      }

      yearsEl.style.setProperty('margin-left', `${yearsMargin}px`);
    }
  }

  scroll(delta) {
    // Days
    const el = this;
    const dates = el.getElementsByClassName('dates')[0];
    this.datesMargin += delta;

    dates.style.setProperty('margin-left', `${this.datesMargin}px`);

    const firstRect = dates.firstChild.getBoundingClientRect();
    let numOfInc = Math.round((firstRect.x + firstRect.width) / this.dateWidth);

    let isLesser = numOfInc < 0;
    let isGreater = numOfInc > 0;

    this.updateCenteredItem();
    this.reshiftChildren();
    const center = this.getCenterItemByTimescale(TIMESCALE.DAY);
    this.updateElementData(center.date);
    return;

    // Months
    const months = el.getElementsByClassName('months')[0];
    let monthsMargin;
    if (this.timescale != TIMESCALE.YEAR) {
      monthsMargin = (dates.firstChild.date.getUTCDate() - 1) * this.dateWidth * -1 + this.datesMargin;

      if (this.timescale == TIMESCALE.MONTH) {
        monthsMargin = this.datesMargin;
      }

      months.style.setProperty('margin-left', `${monthsMargin}px`);

      if (isLesser || isGreater) {
        const firstMonth = dates.firstChild.date.getUTCMonth();
        const lastMonth = dates.lastChild.date.getUTCMonth();
        if (false && firstMonth != this.firstMonth) {
          if (months.firstChild.date.getUTCMonth() != firstMonth) {
            const prevDate = months.lastChild.date;
            const nextDate = this.createDate(prevDate.getUTCFullYear(), prevDate.getUTCMonth() + 1, 1);
            this.updateMonthEl(months.firstChild, nextDate);
            months.append(months.firstChild);
          }
          else if (false && months.lastChild.date.getUTCMonth() != lastMonth) {
            const prevDate = months.firstChild.date;
            const nextDate = this.createDate(prevDate.getUTCFullYear(), prevDate.getUTCMonth() - 1, 1);
            this.updateMonthEl(months.lastChild, nextDate);
            months.prepend(months.lastChild);
          }
          this.firstMonth = firstMonth;
        }
      }
    }

    // Years
    const yearsEl = el.getElementsByClassName('years')[0];

    let firstMonth;
    let yearsMargin;

    if (this.timescale == TIMESCALE.YEAR) {
      firstMonth = dates.firstChild.date;
    } else {
      firstMonth = months.firstChild.date
      yearsMargin = monthsMargin;
    }

    if (this.timescale != TIMESCALE.YEAR) {
      isGreater = months.firstChild.date.getUTCFullYear() < yearsEl.firstChild.date.getUTCFullYear();
      isLesser = months.firstChild.date.getUTCFullYear() > yearsEl.firstChild.date.getUTCFullYear();
    }

    if (firstMonth.getUTCMonth() > 0) {
      let days;
      if (this.timescale == TIMESCALE.DAY) {
        const prevMonth = this.createDate(firstMonth.getUTCFullYear(), firstMonth.getUTCMonth(), 0);
        days = this.getElapsedDaysInYear(prevMonth);
      }
      else if (this.timescale == TIMESCALE.MONTH) {
        days = firstMonth.getUTCMonth();
      }
      yearsMargin -= days * this.dateWidth;
    } else {
      yearsMargin = this.datesMargin;
    }

    yearsEl.style.setProperty('margin-left', `${yearsMargin}px`);

    if (isGreater) {
      const prevDate = yearsEl.firstChild.date;
      const nextDate = this.createDate(prevDate.getUTCFullYear() - 1, 0, 1);
      this.updateYearEl(yearsEl.lastChild, nextDate);
      yearsEl.prepend(yearsEl.lastChild);
    }
    else if (isLesser) {
      const prevDate = yearsEl.lastChild.date;
      const nextDate = this.createDate(prevDate.getUTCFullYear() + 1, 0, 1);
      this.updateYearEl(yearsEl.firstChild, nextDate);
      yearsEl.append(yearsEl.firstChild);
    }

    this.updateCenteredItem();
  }

  updateAllElements(targetDate) {
    this.refreshNumOfChildren();

    this.updateElementData(targetDate);
  }

  centerDate(dateEl, centerline) {
    if (!dateEl) {
      dateEl = this.getCenterItemByTimescale(this.timescale);
    }
    if (!dateEl) {
      return;
    }
    const el = this;
    const datesEl = el.getElementsByClassName('dates')[0];
    datesEl.style.setProperty('margin-left', `${this.datesMargin}px`);

    const centeredRect = dateEl.getBoundingClientRect();
    const centerPointItem = centeredRect.x + (centeredRect.width / 2);
    const centerPointScreen = centerline || window.innerWidth / 2;

    const diff = centerPointScreen - centerPointItem;

    this.datesMargin += diff;
    datesEl.style.setProperty('margin-left', `${this.datesMargin}px`);
  }

  createDate(year, month, date) {
    if (isNotNumber(year)) {
      date = year.getUTCDate();
      month = year.getUTCMonth();
      year = year.getUTCFullYear();
    }
    const newDate = new Date();
    newDate.setUTCFullYear(year, month, date);

    return newDate;
  }

  refreshNumOfChildren(onlyAdd) {
    const el = this;
    const datesEl = el.getElementsByClassName('dates')[0];
    const monthsEl = el.getElementsByClassName('months')[0];
    const yearsEl = el.getElementsByClassName('years')[0];

    const screenWidth = window.innerWidth;
    const extraDays = 1;
    const numOfDates = Math.ceil(screenWidth / this.dateWidth) + extraDays;

    // Just need a safe estimate for the number of months
    let numOfMonths = Number.parseInt(numOfDates / 28);

    if (this.timescale == TIMESCALE.MONTH) {
      numOfMonths = numOfDates;
    }

    // The container must have at least two elements
    if (numOfMonths < 2) {
      numOfMonths = 2;
    }

    let numOfYears = Number.parseInt(numOfMonths / 12);
    if (this.timescale == TIMESCALE.YEAR) {
      numOfYears = numOfDates;
    }

    if (numOfYears < 2) {
      numOfYears = 2;
    }

    // Populate Dates
    const dateDiff = numOfDates - datesEl.children.length;

    if (dateDiff > 0) {
      for (let i = 0; i < dateDiff; i++) {
        const dayEl = this.createDaySection();
        const date = datesEl.lastChild && datesEl.lastChild.date || this.targetDate;
        const newDate = this.createDate(date);

        if (date != this.targetDate) {
          newDate.setUTCDate(newDate.getUTCDate() + 1);
        }

        datesEl.append(dayEl);
        this.updateDateEl(dayEl, newDate);
      }
    }
    else if (dateDiff < 0 && !onlyAdd) {
      for (let i = 0; i < Math.abs(dateDiff); i++) {
        datesEl.lastChild.remove();
      }
    }

    // Populate Months
    const monthDiff = numOfMonths - monthsEl.children.length;

    if (monthDiff > 0) {
      for (let i = 0; i < monthDiff; i++) {
        const monthEl = this.createMonthEl();
        const month = monthsEl.lastChild && monthsEl.lastChild.date || this.targetDate;
        const newDate = this.createDate(month);

        if (month != this.targetDate) {
          newDate.setUTCMonth(newDate.getUTCMonth() + 1);
        }

        monthsEl.append(monthEl);
        this.updateMonthEl(monthEl, newDate);
      }
    }
    else if (monthDiff < 0 && !onlyAdd) {
      for (let i = 0; i < Math.abs(monthDiff); i++) {
        monthsEl.lastChild.remove();
      }
    }

    // Populate Years
    const yearDiff = numOfYears - yearsEl.children.length;

    if (yearDiff > 0) {
      for (let i = 0; i < yearDiff; i++) {
        const yearEl = this.createYearEl();
        const year = yearEl.lastChild && yearEl.lastChild.date || this.targetDate;
        const newDate = this.createDate(year);

        if (year != this.targetDate) {
          newDate.setUTCFullYear(newDate.getUTCFullYear() + 1);
        }

        yearsEl.append(yearEl);
        this.updateYearEl(yearEl, newDate);
      }
    }
    else if (yearDiff < 0 && !onlyAdd) {
      for (let i = 0; i < Math.abs(yearDiff); i++) {
        yearsEl.lastChild.remove();
      }
    }
  }

  setTimescaleClassName(timescale) {
    const el = this;
    if (timescale == TIMESCALE.DAY) {
      el.classList.add('timescale-day');
      el.classList.remove('timescale-month');
      el.classList.remove('timescale-year');
    }
    else if (timescale == TIMESCALE.MONTH) {
      el.classList.remove('timescale-day');
      el.classList.add('timescale-month');
      el.classList.remove('timescale-year');
    }
    else if (timescale == TIMESCALE.YEAR) {
      el.classList.remove('timescale-day');
      el.classList.remove('timescale-month');
      el.classList.add('timescale-year');
    }
  }

  // targetDate corresponds to the centered date
  updateElementData(targetDate) {
    const el = this;
    const datesEl = el.getElementsByClassName('dates')[0];
    const monthsEl = el.getElementsByClassName('months')[0];
    const yearsEl = el.getElementsByClassName('years')[0];

    const numOfDates = datesEl.children.length;
    datesEl.style.setProperty('width', `${numOfDates * this.dateWidth}px`);

    const centerEl = this.getCenterItemByTimescale(TIMESCALE.DAY);
    const children = Array.from(datesEl.children);
    const centerIndex = children.indexOf(centerEl);
    let inc = centerIndex * -1;

    let nextDate;
    for (const dateEl of datesEl.children) {
      if (this.timescale == TIMESCALE.DAY) {
        nextDate = this.createDate(targetDate.getUTCFullYear(), targetDate.getUTCMonth(), targetDate.getUTCDate() + inc);
      } else if (this.timescale == TIMESCALE.MONTH) {
        nextDate = this.createDate(targetDate.getUTCFullYear(), targetDate.getUTCMonth() + inc, 1);
      } else if (this.timescale == TIMESCALE.YEAR) {
        nextDate = this.createDate(targetDate.getUTCFullYear() + inc, 0, 1);
      }
      this.updateDateEl(dateEl, nextDate);

      inc += 1;
    }

    nextDate = datesEl.firstChild.date;
    for (const monthEl of monthsEl.children) {
      this.updateMonthEl(monthEl, nextDate);

      nextDate = this.createDate(nextDate.getUTCFullYear(), nextDate.getUTCMonth() + 1, 1);
    }

    nextDate = datesEl.firstChild.date;
    for (const yearEl of yearsEl.children) {
      this.updateYearEl(yearEl, nextDate);

      nextDate = this.createDate(nextDate.getUTCFullYear() + 1, 0, 1);
    }

    this.refreshMargin();
  }

  updateDateEl(el, date) {
    if (this.timescale == TIMESCALE.MONTH) {
      date.setUTCDate(1);
    } else if (this.timescale == TIMESCALE.YEAR) {
      date.setUTCDate(1);
      date.setUTCMonth(0);
    }
    el.date = date;

    const dayNum = el.getElementsByClassName('day-number')[0];
    dayNum.replaceChildren(date.getUTCDate());

    const dayName = el.getElementsByClassName('day-name')[0];
    dayName.replaceChildren(dayNames[date.getUTCDay()]);
  }

  refreshMonthEl(el) {
    let monthWidth = el.daysInMonth * this.dateWidth;

    if (this.timescale == TIMESCALE.MONTH) {
      monthWidth = this.dateWidth;
    }

    el.style.setProperty('width', `${monthWidth}px`);

    const label = el.getElementsByClassName('month-name')[0];
    label.replaceChildren(monthNames[el.date.getUTCMonth()]);
  }

  updateMonthEl(el, date) {
    const daysInMonth = this.getTotalDaysInMonth(date.getUTCFullYear(), date.getUTCMonth());

    el.date = date;
    el.daysInMonth = daysInMonth;

    this.refreshMonthEl(el);
  }

  updateYearEl(el, date) {
    let yearWidth;

    if (this.timescale == TIMESCALE.DAY) {
      const daysInYear = this.getTotalDaysInYear(date);
      yearWidth = daysInYear * this.dateWidth;
    }
    else if (this.timescale == TIMESCALE.MONTH) {
      yearWidth = 12 * this.dateWidth;
    }
    else if (this.timescale == TIMESCALE.YEAR) {
      yearWidth = this.dateWidth;
    }

    el.style.setProperty('width', `${yearWidth}px`);

    const label = el.getElementsByClassName('year-name')[0];
    label.replaceChildren(date.getUTCFullYear());

    el.date = date;
  }

  createYearEl() {
    const container = document.createElement('div');
    container.classList.add('year');

    const label = document.createElement('div');
    label.classList.add('year-name');

    const span = document.createElement('span');
    span.append(label);

    container.append(span);
    return container;
  }

  createMonthEl() {
    const container = document.createElement('div');
    container.classList.add('month');

    const label = document.createElement('div');
    label.classList.add('month-name');

    const span = document.createElement('span');
    span.append(label);

    container.append(span);

    return container;
  }

  getElapsedDaysInYear(date) {
    const year = date.getUTCFullYear();
    const month = date.getUTCMonth();
    const dateNum = date.getUTCDate();
    const startOfYear = this.createDate(year, 0, 1);
    const endOfYear = this.createDate(year, month, dateNum);
    const dayInMs = 86400000;
    let days = (endOfYear - startOfYear) / dayInMs;

    return days;
  }

  getTotalDaysInYear(date) {
    const year = date.getUTCFullYear();
    const startOfYear = this.createDate(year, 0, 1);
    const endOfYear = this.createDate(year + 1, 0, 0);
    const dayInMs = 86400000;
    let days = (endOfYear - startOfYear) / dayInMs;

    return days;
  }

  getTotalDaysInMonth(year, month) {
    if (isDate(year)) {
      month = year.getUTCMonth();
      year = year.getUTCFullYear();
    }
    const date = this.createDate(year, month + 1, 0);

    return date.getUTCDate();
  }

  createDaySection() {
    const container = document.createElement('div');
    container.classList.add('date');

    const num = document.createElement('div');
    num.classList.add('day-number');

    const name = document.createElement('div');
    name.classList.add('day-name');

    const marker = document.createElement('div');
    marker.classList.add('segment-marker');

    const description = document.createElement('div');
    description.classList.add('description');

    container.append(num);
    container.append(name);
    container.append(marker);
    container.append(description);

    return container;
  }
}
customElements.define('timeline-component', Timeline);
