<template>
  <!-- Head makes a SPA SSR ready -->
  <AppHead>
    <title>Vue 3 Forum</title>
    <meta name="description" content="An awesome Vue.js 3 powered forum!" />

    <!-- Social -->
    <meta property="og:title" content="Vue.js 3 Master Class Forum">
    <meta property="og:description" content="An Awesome Vue.js 3 powered forum!">
    <meta property="og:image" content="https://vueschool.io/media/f007f6057444d9a7f567163391d2b366/vuejs-3-master-class-not-transparent.jpg">

    <!-- Twitter -->
    <meta name="twitter:title" content="Vue.js 3 Master Class Forum">
    <meta name="twitter:description" content="An Awesome Vue.js 3 powered forum!">
    <meta name="twitter:image" content="https://vueschool.io/media/f007f6057444d9a7f567163391d2b366/vuejs-3-master-class-not-transparent.jpg">
    <meta name="twitter:card" content="summary_large_image">
  </AppHead>
  <the-navbar />
  <div class="container">
    <!--
    router-view is a placeholder to render the component configured at
    router/index.js route path
    Thus you don't need to register that component inside App.vue

    - NB:: prefer v-show to v-if if you want show something so more
    often on the DOM.
    - v-show has initial cost but v-if has even more throttle cost.
    -->
    <router-view
      v-show="showPage"
      @ready="onPageReady"
      :key="`${$route.path}${JSON.stringify($route.query)}`"
    />
    <app-spinner v-show="!showPage" />
  </div>
  <AppNotifications />
</template>

<script>
import { mapActions } from 'vuex';
import NProgress from 'nprogress';
import TheNavbar from '@/components/TheNavbar.vue';
import AppNotifications from '@/components/AppNotifications.vue';

export default {
  name: 'App',
  components: { TheNavbar, AppNotifications },
  data() {
    return { showPage: false };
  },
  methods: {
    ...mapActions('auth', ['fetchAuthUser']),
    onPageReady() {
      this.showPage = true;
      NProgress.done();
    },
  },
  created() {
    // Fetch the authenticated user from state
    this.fetchAuthUser();
    NProgress.configure({
      speed: 200,
      showSpinner: false,
    });
    // Access beforeEach and reset showPage state on route change
    this.$router.beforeEach(() => {
      this.showPage = false;
      NProgress.start();
    });
  },
};
</script>

<style>
/* Global Styles Live Here, so they can be minified when in production */
@import 'assets/style.css';
@import '~nprogress/nprogress.css';
#nprogress .bar {
  background: #4e9c7f;
}
</style>
