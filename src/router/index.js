import { createRouter, createWebHistory } from 'vue-router';
import store from '@/store';
import { findById } from '@/helpers';

// Define your routes
const routes = [
  {
    path: '/',
    name: 'Home',
    component: () => import(/* webpackChunkName: "Home" */ '@/pages/Home.vue'),
  },
  {
    path: '/forum/:forumId/thread/create',
    name: 'ThreadCreate',
    component: () => import(/* webpackChunkName: "ThreadCreate" */ '@/pages/ThreadCreate.vue'),
    props: true,
    meta: { requiresAuth: true },
  },
  {
    path: '/thread/:id/edit',
    name: 'ThreadEdit',
    component: () => import(/* webpackChunkName: "ThreadEdit" */ '@/pages/ThreadEdit.vue'),
    props: true,
    meta: { requiresAuth: true },
  },
  {
    path: '/forum/:id',
    name: 'Forum',
    component: () => import(/* webpackChunkName: "Forum" */ '@/pages/Forum.vue'),
    props: true,
  },

  // Two routes can use same Component but different names
  {
    path: '/me',
    name: 'Profile',
    component: () => import(/* webpackChunkName: "Profile" */ '@/pages/Profile.vue'),

    // Route's meta fields help add custom attributes to a route
    meta: { toTop: true, smoothScroll: true, requiresAuth: true },
  },
  {
    path: '/me/edit',
    name: 'ProfileEdit',
    component: () => import(/* webpackChunkName: "Profile" */ '@/pages/Profile.vue'),
    // Update your props here too e.g. a negation
    props: { edit: true },
    meta: { requiresAuth: true },
  },
  {
    path: '/category/:id',
    name: 'Category',
    component: () => import(/* webpackChunkName: "Category" */ '@/pages/Category.vue'),
    props: true,
  },
  {
    path: '/thread/:id',
    name: 'ThreadShow',
    component: () => import(/* webpackChunkName: "ThreadShow" */ '@/pages/ThreadShow.vue'),
    // Allow props in named routes
    props: true,

    // Route Guard; Handle wrong thread paths
    async beforeEnter(to, from, next) {
      await store.dispatch('threads/fetchThread', { id: to.params.id, once: true });
      // check if thread exists
      const threadExists = findById(store.state.threads.items, to.params.id);
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

  {
    path: '/register',
    name: 'Register',
    component: () => import(/* webpackChunkName: "Register" */ '@/pages/Register.vue'),

    // A logged in user doesn't need to see certain pages
    meta: { requiresGuest: true },
  },
  {
    path: '/signin',
    name: 'SignIn',
    component: () => import(/* webpackChunkName: "SignIn" */ '@/pages/Signin.vue'),
    meta: { requiresGuest: true },
  },

  // SignOut is a componentless route
  {
    path: '/signout',
    name: 'SignOut',
    async beforeEnter() {
      await store.dispatch('auth/signOut');
      // Redirect to home page
      return { name: 'Home' };
    },
  },

  // will match everything and put it under `$route.params.pathMatch`
  {
    path: '/:pathMatch(.*)*',
    name: 'NotFound',
    component: () => import(/* webpackChunkName: "NotFound" */ '@/pages/NotFound.vue'),
  },
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

// Clear items from state after navigating from a page/route to the next
router.afterEach(() => {
  // Tip:: No need to clear users thus we won't lose the authenticated user
  store.dispatch('clearItems', { modules: ['categories', 'forums', 'posts', 'threads'] });
});

// Below is a global navigation guard, runs before each route in the application
// eslint-disable-next-line consistent-return
router.beforeEach(async (to) => {
  await store.dispatch('auth/initAuthentication');
  // Unsubscribe from onSnapshot events
  store.dispatch('unsubscribeAllSnapshots');

  // Check whether a page we are navigating to has a specific meta and act
  if (to.meta.requiresAuth && !store.state.auth.authId) {
    // Add query params to be able to redirect to the place user intended
    return { name: 'SignIn', query: { redirectTo: to.path } };
  }

  // If it's a loggedin user, redirect to home page
  if (to.meta.requiresGuest && store.state.auth.authId) {
    return { name: 'Home' };
  }
});

export default router;
