<template>
  <div class="container">
    <!--
    router-view will always render the correct component configured at
    main.js
    Thus you don't need to register that component inside App.vue
    -->
    <router-view />
  </div>
</template>

<script>
export default {
  name: 'App',
};
</script>

<style>
/* Global Styles Live Here, so they can be minified when in production */
@import 'assets/style.css';
</style>
