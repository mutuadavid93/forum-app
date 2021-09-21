import { createRouter, createWebHistory } from 'vue-router';
import Home from '@/pages/Home.vue';
import ThreadShow from '@/pages/ThreadShow.vue';
import ThreadCreate from '@/pages/ThreadCreate.vue';
import ThreadEdit from '@/pages/ThreadEdit.vue';
import NotFound from '@/pages/NotFound.vue';
import Forum from '@/pages/Forum.vue';
import Category from '../pages/Category.vue';
import Profile from '@/pages/Profile.vue';
import store from '@/store';
// Define your routes
const routes = [
  { path: '/', name: 'Home', component: Home },
  {
    path: '/forum/:forumId/thread/create',
    name: 'ThreadCreate',
    component: ThreadCreate,
    props: true,
  },
  {
    path: '/thread/:id/edit',
    name: 'ThreadEdit',
    component: ThreadEdit,
    props: true,
  },
  {
    path: '/forum/:id',
    name: 'Forum',
    component: Forum,
    props: true,
  },

  // Two routes can use same Component but different names
  {
    path: '/me',
    name: 'Profile',
    component: Profile,
    meta: { toTop: true, smoothScroll: true },
  },
  {
    path: '/me/edit',
    name: 'ProfileEdit',
    component: Profile,
    // Update your props here too e.g. a negation
    props: { edit: true },
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
    // async beforeEnter(to, from, next) {
    //   await store.dispatch('fetchThread', { id: to.params.id, once: true });
    //   // check if thread exists
    //   const threadExists = findById(store.state.threads.items, to.params.id);
    //   // if it exists, continue
    //   if (threadExists) {
    //     return next();
    //   }
    //   return next({
    //     name: 'NotFound',
    //     // Give the user a chance to edit their wrong url
    //     params: { pathMatch: to.path.substring(1).split('/') },
    //     // Preserve existing query and hash
    //     query: to.query,
    //     hash: to.hash,
    //   });
    // },
  },
  // will match everything and put it under `$route.params.pathMatch`
  { path: '/:pathMatch(.*)*', name: 'NotFound', component: NotFound },
];

const router = createRouter({
  // Don't use the createWebHashHistory() instead use createWebHistory() thus
  // your URLs look natural
  history: createWebHistory(),
  routes,

  // Restrict scroll beahavior only to routes that have specified
  scrollBehavior(to) {
    const scroll = {};
    if (to.meta.toTop) scroll.top = 0;
    if (to.meta.smoothScroll) scroll.behavior = 'smooth';
    return scroll;
  },
});

// Unsubscribe from onSnapshot events
router.beforeEach(() => {
  store.dispatch('unsubscribeAllSnapshots');
});

export default router;
