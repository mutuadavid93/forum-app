<template>
<the-navbar/>
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
import { mapActions } from 'vuex';
import TheNavbar from '@/components/TheNavbar.vue';

export default {
  name: 'App',
  components: { TheNavbar },
  methods: {
    ...mapActions(['fetchAuthUser']),
  },
  // Fetch the authenticated user from state
  created() {
    this.fetchAuthUser();
  },
};
</script>

<style>
/* Global Styles Live Here, so they can be minified when in production */
@import "assets/style.css";
</style>
