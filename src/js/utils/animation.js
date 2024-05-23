const MILLISECONDS_IN_SECOND = 1000;

/**
 * Resets a CSS animation for an element.
 * @param {HTMLElement} element - the element to reset the animation for.
 * @param {string} className - the CSS class that adds the animation.
 */
const _resetCSSAnimation = (element, className) => {
  element.classList.remove(className);
  void element.offsetWidth;
  element.classList.add(className);
};

/**
 * Hides an element (removes a class with an animation showing the element, e.g. .shown).
 * @param {HTMLElement} element - the element to be hidden (animated).
 * @param {string} className - the CSS class that adds the animation.
 */
const removeAnimationClass = (element, className) => {
  _resetCSSAnimation(element, className);
  element.style.animationDirection = 'reverse';

  window.setTimeout(() => {
    element.classList.remove(className);
    element.style.removeProperty('animation-direction');
  }, parseFloat(window.getComputedStyle(element).animationDuration) * MILLISECONDS_IN_SECOND);
};

export {removeAnimationClass};
