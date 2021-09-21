import { createApp } from 'vue';
import firebase from 'firebase';
import { library } from '@fortawesome/fontawesome-svg-core';
import { faPencilAlt } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome';
import App from '@/App.vue';
import store from '@/store';
import router from '@/router';
import { firebaseConfig } from '@/config/firebase';

library.add(faPencilAlt);

// Initialize Firebase
firebase.initializeApp(firebaseConfig);

const forumApp = createApp(App);
forumApp.use(router);
forumApp.use(store);

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
