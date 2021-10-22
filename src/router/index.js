import { createRouter, createWebHistory } from 'vue-router';
import Home from '@/pages/Home.vue';
import ThreadShow from '@/pages/ThreadShow.vue';
import ThreadCreate from '@/pages/ThreadCreate.vue';
import ThreadEdit from '@/pages/ThreadEdit.vue';
import NotFound from '@/pages/NotFound.vue';
import Forum from '@/pages/Forum.vue';
import Category from '../pages/Category.vue';
import Profile from '@/pages/Profile.vue';
import Register from '@/pages/Register.vue';
import SignIn from '@/pages/Signin.vue';
import store from '@/store';
import { findById } from '@/helpers';

// Define your routes
const routes = [
  { path: '/', name: 'Home', component: Home },
  {
    path: '/forum/:forumId/thread/create',
    name: 'ThreadCreate',
    component: ThreadCreate,
    props: true,
    meta: { requiresAuth: true },
  },
  {
    path: '/thread/:id/edit',
    name: 'ThreadEdit',
    component: ThreadEdit,
    props: true,
    meta: { requiresAuth: true },
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

    // Route's meta fields help add custom attributes to a route
    meta: { toTop: true, smoothScroll: true, requiresAuth: true },
  },
  {
    path: '/me/edit',
    name: 'ProfileEdit',
    component: Profile,
    // Update your props here too e.g. a negation
    props: { edit: true },
    meta: { requiresAuth: true },
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
    async beforeEnter(to, from, next) {
      await store.dispatch('fetchThread', { id: to.params.id });
      // check if thread exists
      const threadExists = findById(store.state.threads, to.params.id);
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
    component: Register,

    // A logged in user doesn't need to see certain pages
    meta: { requiresGuest: true },
  },
  {
    path: '/signin',
    name: 'SignIn',
    component: SignIn,
    meta: { requiresGuest: true },
  },

  // SignOut is a componentless route
  {
    path: '/signout',
    name: 'SignOut',
    async beforeEnter() {
      await store.dispatch('signOut');
      // Redirect to home page
      return { name: 'Home' };
    },
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

// Below is a global navigation guard, runs before each route in the application
// eslint-disable-next-line consistent-return
router.beforeEach(async (to, from) => {
  await store.dispatch('initAuthentication');
  // Unsubscribe from onSnapshot events
  store.dispatch('unsubscribeAllSnapshots');

  // Check whether a page we are navigating to has a specific meta and act
  if (to.meta.requiresAuth && !store.state.authId) {
    // Add query params to be able to redirect to the place user intended
    return { name: 'SignIn', query: { redirectTo: to.path } };
  }

  // If it's a loggedin user, redirect to home page
  if (to.meta.requiresGuest && store.state.authId) {
    return { name: 'Home' };
  }
});

export default router;
