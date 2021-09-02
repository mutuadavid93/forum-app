import { createRouter, createWebHistory } from 'vue-router';
import Home from '@/pages/Home.vue';
import ThreadShow from '@/pages/ThreadShow.vue';
import NotFound from '@/pages/NotFound.vue';
import Forum from '@/pages/Forum.vue';
import Category from '../pages/Category.vue';
import sourceData from '@/seed.json';

// Define your routes
const routes = [
  { path: '/', name: 'Home', component: Home },
  {
    path: '/forum/:id',
    name: 'Forum',
    component: Forum,
    props: true,
  },
  {
    path: '/category/:id',
    name: 'Category',
    component: Category,
    props: true,
  },
  {
    path: '/thread/:id',
    name: 'ThreadShow',
    component: ThreadShow,
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
  { path: '/:pathMatch(.*)*', name: 'NotFound', component: NotFound },
];

export default createRouter({
  // Don't use the createWebHashHistory() instead use createWebHistory() thus
  // your URLs look natural
  history: createWebHistory(),
  routes,
});
