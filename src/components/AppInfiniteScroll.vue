<template>
  <div class="inersection-observer"></div>
</template>
<script>
export default {
  props: {
    done: { type: Boolean, default: false },
  },
  data() {
    return {
      observer: null,
    };
  },
  mounted() {
    this.observer = new IntersectionObserver(
      (entries, observer) => {
        entries.forEach((entry) => {
          // Whenever the div in the template is within the visible page
          // the component emits a load event
          if (entry.isIntersecting) this.$emit('load');
        });
      },
      {
        root: null, // Default to browser viewport if null
        rootMargin: '0px',
        threshold: 0.9,
        // eslint-disable-next-line comma-dangle
      }
    );
    this.observer.observe(this.$el);
  },
  unmounted() {
    // clean up intersection observers
    this.observer.unobserve(this.$el);
  },
  watch: {
    // Whenever the parent component tells this component that's done loading
    // every page of resources, we turn off the intersection observer.
    done() {
      if (this.done) this.observer.unobserve(this.$el);
    },
  },
};
</script>
<style scoped>
div {
  position: relative;
  z-index: -1;
  pointer-events: none;
  bottom: 200px;
}
</style>
