/* eslint-disable no-param-reassign */
/* eslint-disable no-underscore-dangle */
import debounce from 'lodash/debounce';

const PageScrollDirective = {
  mounted(el, binding) {
    // Assign the binding value i.e. passed in function on the directive to a
    // property on the element
    el.__PageScroll__ = debounce(
      () => {
        binding.value();
      },
      200,
      // eslint-disable-next-line comma-dangle
      { leading: true } // execute the function first then apply timeout
    );

    // use the function on an event listener
    // Tip:: the event listener executes the function logic on the component
    document.addEventListener('scroll', el.__PageScroll__);
  },

  unmounted(el) {
    // clean up
    document.removeEventListener('scroll', el.__PageScroll__);
  },
};

export default (app) => {
  app.directive('page-scroll', PageScrollDirective);
};
