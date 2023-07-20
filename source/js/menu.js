import {removeAnimationClass} from './utils.js';

const ANIMATION_DURATION = 300;
const MEDIA_QUERY = '(min-width: 768px)';
const ElementClass = {
  MENU: 'main-menu',
  MENU_OPENED: 'main-menu--opened',
  TOGGLE: 'header__toggle',
  TOGGLE_OPENED: 'header__toggle--opened',
};
const ToggleText = {
  OPENED: 'Close menu',
  CLOSED: 'Open menu',
};

const menu = document.querySelector(`.${ElementClass.MENU}`);
const menuToggle = document.querySelector(`.${ElementClass.TOGGLE}`);
const mediaQueryList = window.matchMedia(MEDIA_QUERY);

/**
 * Toggles a menu to the opened/closed state depending on the passed argument
 *
 * @param {boolean} [doOpen] - true if the menu should be closed, or false if it should be opened; if no argument was passed, then the menu will change its state to the opposite
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
    removeAnimationClass(menu, ElementClass.MENU_OPENED, ANIMATION_DURATION);
    removeAnimationClass(menuToggle, ElementClass.TOGGLE_OPENED, ANIMATION_DURATION);
  }

  menuToggle.lastElementChild.textContent = toggleText;
  menuToggle.setAttribute('aria-label', toggleText);
  menuToggle.setAttribute('aria-expanded', doOpen);
};

/**
 * Handles mouse clicks in the menu
 */
const onMenuClick = () => {
  toggleMenu();
};

/**
 * Adds event listeners to the menu if it is a mobile layout, and removes them otherwise
 *
 * @param {Event} evt - a change event object
 */
const onLayoutChange = function(evt) {
  if (evt.matches) {
    toggleMenu(false);

    menu.removeEventListener('click', onMenuClick);
    menuToggle.removeEventListener('click', onMenuClick);
  } else {
    menu.addEventListener('click', onMenuClick);
    menuToggle.addEventListener('click', onMenuClick);
  }
};

/**
 * Adds event listeners to the menu and MediaQueryList
 */
export default () => {
  if (!mediaQueryList.matches) {
    menu.addEventListener('click', onMenuClick);
    menuToggle.addEventListener('click', onMenuClick);
  }

  mediaQueryList.addEventListener('change', onLayoutChange);
};
