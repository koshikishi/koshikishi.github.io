const ANIMATION_DIRECTION = 'reverse';

/**
 * Resets a CSS animation for an element.
 * @param {HTMLElement} element - the element to reset the animation for.
 * @param {string} className - the CSS class that adds the animation.
 */
const resetCSSAnimation = (element, className) => {
  element.classList.remove(className);
  void element.offsetWidth;
  element.classList.add(className);
};

/**
 * Hides an element (removes a class with an animation showing the element, e.g. .shown).
 * @param {HTMLElement} element - the element to be hidden (animated).
 * @param {string} className - the CSS class that adds the animation.
 * @param {number} timer - the animation duration (ms).
 */
const removeAnimationClass = (element, className, timer) => {
  resetCSSAnimation(element, className);
  element.style.animationDirection = ANIMATION_DIRECTION;

  window.setTimeout(() => {
    element.classList.remove(className);
    element.style.removeProperty('animation-direction');
  }, timer);
};

export {removeAnimationClass};
