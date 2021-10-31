/* eslint-disable no-param-reassign */
/* eslint-disable no-underscore-dangle */

// Custom Directives are also called plugins
// Register them as other plugins inside main.js

const ClickOutSideDirective = {
  // Custom directives contain lifecycle hooks similar to components
  // @el, the element the directive is used on
  // @binding, object containing component instance and value provided to the directive
  mounted(el, binding) {
    el.__clickOusideHandler__ = (event) => {
      // If clicked element is the same as the one with the directive on it or
      // A child of the element has the directive in it
      if (!(el === event.target || el.contains(event.target))) {
        // Call the function passed as the value of the directive
        binding.value(event);
      }
    };

    document.body.addEventListener('click', el.__clickOusideHandler__);
  },

  unmounted(el) {
    document.body.removeEventListener('click', el.__clickOusideHandler__);
  },
};

export default (app) => {
  // Register the directive
  app.directive('click-outside', ClickOutSideDirective);
};
