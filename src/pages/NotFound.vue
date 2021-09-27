<template>
  <div class="col-full text-centre">
    <h1>Not Found</h1>
    <router-link :to="{ name: 'Home' }">Read some cool threads instead</router-link>
  </div>
</template>

<script>
export default {
  // NB:: On non async fetching pages, we need to emit the ready event manually
  // to be caught by vue-router
  created() {
    this.$emit('ready');
  },
};
</script>
