<template>
  <the-navbar />
  <div class="container">
    <!--
    router-view will always render the correct component configured at
    main.js
    Thus you don't need to register that component inside App.vue

    - NB:: prefer v-show to v-if if you want show something so more
    often on the DOM.
    - v-show has initial cost but v-if has even more throttle cost.
    -->
    <router-view v-show="showPage" @ready="onPageReady" />
    <app-spinner v-show="!showPage" />
  </div>
</template>

<script>
import { mapActions } from 'vuex';
import NProgress from 'nprogress';
import TheNavbar from '@/components/TheNavbar.vue';

export default {
  name: 'App',
  components: { TheNavbar },
  data() {
    return { showPage: false };
  },
  methods: {
    ...mapActions(['fetchAuthUser']),
    onPageReady() {
      this.showPage = true;
      NProgress.done();
    },
  },
  // Fetch the authenticated user from state
  mounted() {
    this.fetchAuthUser();
  },
  created() {
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
#nprogress .bar{
  background: #4E9C7F;
}
</style>
