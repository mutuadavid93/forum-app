// Mixins options are merged with component's options where the mixin is used.
// Options naming should be prefixed with the mixin's file name
export default {
  data() {
    return { asyncDataStatus_ready: false };
  },
  methods: {
    asyncDataStatus_fetched() {
      this.asyncDataStatus_ready = true;
      // Emit a ready event to be used in our router-view component i.e. on each
      // page load
      this.$emit('ready');
    },
  },
};
