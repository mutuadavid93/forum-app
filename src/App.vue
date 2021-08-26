<template>
  <img alt="Vue logo" src="./assets/logo.png" />
  <div class="container">
    <page-home></page-home>
  </div>
</template>

<script>
import PageHome from './components/PageHome.vue';

export default {
  name: 'App',
  components: {
    PageHome,
  },
};
</script>

<style>
/* Global Styles Live Here, so they can be minified when in production */
@import "assets/style.css"
</style>
