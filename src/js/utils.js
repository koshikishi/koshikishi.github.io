const ANIMATION_DIRECTION = 'reverse';

/**
 * Resets CSS-animation for an element
 *
 * @param {Element} element - an element to reset the animation for
 * @param {string} className - CSS-class that adds the animation
 */
const resetCSSAnimation = (element, className) => {
  element.classList.remove(className);
  void element.offsetWidth;
  element.classList.add(className);
};

/**
 * Hides an element (removes a class with an animation showing the element, for example .shown)
 *
 * @param {Element} element - an element to be hidden (animated)
 * @param {string} className - CSS-class that adds the animation
 * @param {number} timer - an animation duration (ms)
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
