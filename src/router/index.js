import { createRouter, createWebHistory } from 'vue-router';
import PageHome from '@/components/PageHome.vue';
import PageThreadShow from '@/components/PageThreadShow.vue';
import PageNotFound from '@/components/PageNotFound.vue';
import sourceData from '@/seed.json';

// Define your routes
const routes = [
  { path: '/', name: 'Home', component: PageHome },
  {
    path: '/thread/:id',
    name: 'ThreadShow',
    component: PageThreadShow,
    // Allow props in named routes
    props: true,

    // Route Guard; Handle wrong thread paths
    beforeEnter(to, from, next) {
      // check if thread exists
      const threadExists = sourceData.threads.find((thread) => thread.id === to.params.id);
      // if it exists, continue
      if (threadExists) {
        return next();
      }
      return next({
        name: 'NotFound',
        // Give the user a chance to edit their wrong url
        params: { pathMatch: to.path.substring(1).split('/') },
        // Preserve existing query and hash
        query: to.query,
        hash: to.hash,
      });
    },
  },
  // will match everything and put it under `$route.params.pathMatch`
  { path: '/:pathMatch(.*)*', name: 'NotFound', component: PageNotFound },
];

export default createRouter({
  // Don't use the createWebHashHistory() instead use createWebHistory() thus
  // your URLs look natural
  history: createWebHistory(),
  routes,
});
