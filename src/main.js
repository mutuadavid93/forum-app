import { createApp } from 'vue';
import App from '@/App.vue';
import store from '@/store';
import router from '@/router';

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

forumApp.mount('#app');
