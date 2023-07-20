(() => {
  const menu = document.querySelector('.main-menu');
  const menuToggler = document.querySelector('.header__toggle');
  const menuLinks = menu.querySelectorAll('.main-menu__link');

  const openMenu = () => {
    menuToggler.ariaLabel = menuToggler.lastChild.innerText = 'Close menu';
    menuToggler.ariaExpanded = true;

    addAnimationClass(menuToggler, 'header__toggle--opened');
    addAnimationClass(menu, 'main-menu--opened');
  };

  const closeMenu = () => {
    menuToggler.ariaLabel = menuToggler.lastChild.innerText = 'Open menu';
    menuToggler.ariaExpanded = false;

    removeAnimationClass(menuToggler, 'header__toggle--opened', 300);
    removeAnimationClass(menu, 'main-menu--opened', 300);
  };

  const onMenuButtonsClickHandler = () => {
    if (menu.classList.contains('main-menu--opened')) {
      closeMenu();
    } else {
      openMenu();
    }
  };

  const onWindowResizeHandler = function() {
    if (this.matches) {
      if (menu.classList.contains('main-menu--opened')) {
        closeMenu();
      }

      menuToggler.removeEventListener('click', onMenuButtonsClickHandler);

      for (const link of menuLinks) {
        link.removeEventListener('click', onMenuButtonsClickHandler);
      }
    } else {
      menuToggler.addEventListener('click', onMenuButtonsClickHandler);

      for (const link of menuLinks) {
        link.addEventListener('click', onMenuButtonsClickHandler);
      }
    }
  };

  onWindowResizeHandler();

  window.matchMedia('(min-width: 768px)').addEventListener('change', onWindowResizeHandler);

  /**
   * Displays the element (adds a class with animation showing the element, for example .shown)
   * @param {Object} el - the element to be displayed (animated)
   * @param {string} cls - CSS-class that defines the animation
   */
  function addAnimationClass(el, cls) {
    el.classList.add(cls);
  }

  /**
   * Hides the element (removes a class with animation showing the element, for example .shown)
   * @param {Object} el - the element to be hidden (animated)
   * @param {string} cls - CSS-class that defines the animation
   * @param {number} timer - animation duration in milliseconds
   */
  function removeAnimationClass(el, cls, timer) {
    resetCSSAnimation(el, cls);
    el.style.animationDirection = 'reverse';

    window.setTimeout(() => {
      el.classList.remove(cls);
      el.style.removeProperty('animation-direction');
    }, timer);
  }

  /**
   * Resets CSS-animation for the element
   * @param {Object} el - the element to reset the animation for
   * @param {string} cls - CSS-class that defines the animation
   */
  function resetCSSAnimation(el, cls) {
    el.classList.remove(cls);
    void el.offsetWidth;
    el.classList.add(cls);
  }
})();
