import {removeAnimationClass} from '../utils/animation';

const MEDIA_QUERY = '(width < 768px)';
const ElementClass = {
  HEADER: 'header',
  HEADER_NOJS: 'header--nojs',
  MENU: 'main-menu',
  MENU_OPENED: 'main-menu--opened',
  TOGGLE: 'header__toggle',
  TOGGLE_OPENED: 'header__toggle--opened',
};
const ToggleText = {
  OPENED: 'Close menu',
  CLOSED: 'Open menu',
};

const header = document.querySelector(`.${ElementClass.HEADER}`);
const menu = document.querySelector(`.${ElementClass.MENU}`);
const menuToggle = document.querySelector(`.${ElementClass.TOGGLE}`);
const mediaQueryList = window.matchMedia(MEDIA_QUERY);

/**
 * Toggles the menu to the opened/closed state depending on the passed argument.
 * @param {boolean} [doOpen] - true to open the menu, or false to close it. If no argument was passed, the menu will change its state to the opposite.
 */
const toggleMenu = (doOpen = !menu.classList.contains(ElementClass.MENU_OPENED)) => {
  if (doOpen === menu.classList.contains(ElementClass.MENU_OPENED)) {
    return;
  }

  const toggleText = doOpen ? ToggleText.OPENED : ToggleText.CLOSED;

  if (doOpen) {
    menu.classList.add(ElementClass.MENU_OPENED);
    menuToggle.classList.add(ElementClass.TOGGLE_OPENED);
  } else {
    removeAnimationClass(menu, ElementClass.MENU_OPENED);
    removeAnimationClass(menuToggle, ElementClass.TOGGLE_OPENED);
  }

  menuToggle.lastElementChild.textContent = toggleText;
  menuToggle.setAttribute('aria-label', toggleText);
  menuToggle.setAttribute('aria-expanded', doOpen);
};

/**
 * Handles mouse clicks in the menu.
 */
const onMenuClick = () => {
  toggleMenu();
};

/**
 * Adds event listeners to the menu for mobile viewports and removes them otherwise.
 * @param {MediaQueryListEvent} evt - a change event object.
 */
const onViewportChange = (evt) => {
  if (evt.matches) {
    menu.addEventListener('click', onMenuClick);
    menuToggle.addEventListener('click', onMenuClick);
  } else {
    toggleMenu(false);

    menu.removeEventListener('click', onMenuClick);
    menuToggle.removeEventListener('click', onMenuClick);
  }
};

/**
 * Initializes the menu for mobile viewports and watches for the viewport changes.
 */
const initMenu = () => {
  header.classList.remove(ElementClass.HEADER_NOJS);

  if (mediaQueryList.matches) {
    menu.addEventListener('click', onMenuClick);
    menuToggle.addEventListener('click', onMenuClick);
  }

  mediaQueryList.addEventListener('change', onViewportChange);
};

export {initMenu};
