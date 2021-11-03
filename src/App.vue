<template>
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
