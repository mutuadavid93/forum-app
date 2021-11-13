import { createApp } from 'vue';
import { library } from '@fortawesome/fontawesome-svg-core';
import { faPencilAlt, faCamera } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome';
import { createHead } from '@vueuse/head';
import firebase from '@/helpers/firebase';
import App from '@/App.vue';
import store from '@/store';
import router from '@/router';
import { firebaseConfig } from '@/config/firebase';
import ClickOutSideDirective from '@/plugins/ClickOutsideDirective';
import PageScrollDirective from '@/plugins/PageScrollDirective';
import Vue3Pagination from '@/plugins/Vue3Pagination';
import VeeValidatePlugin from '@/plugins/VeeValidatePlugin';

library.add(faPencilAlt, faCamera);

// Initialize Firebase
firebase.initializeApp(firebaseConfig);

const forumApp = createApp(App);
forumApp.use(router);
forumApp.use(store);
forumApp.use(createHead());

// Register plugins
forumApp.use(PageScrollDirective);
forumApp.use(ClickOutSideDirective);
forumApp.use(Vue3Pagination);
forumApp.use(VeeValidatePlugin);

// Implicitly import and register Global components
const requireComponent = require.context('@/components', true, /App[A-Z]\w+\.(vue|js)$/);
requireComponent.keys().forEach((fileName) => {
  let baseComponentConfig = requireComponent(fileName);
  baseComponentConfig = baseComponentConfig.default || baseComponentConfig;
  // prettier-ignore
  const baseComponentName = baseComponentConfig.name || fileName.replace(/^.+\//, '').replace(/\.\w+$/, '');
  forumApp.component(baseComponentName, baseComponentConfig);
});
forumApp.component('fa', FontAwesomeIcon);

forumApp.mount('#app');
