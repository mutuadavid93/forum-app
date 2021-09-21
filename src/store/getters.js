import { findById } from '@/helpers';

export default {
  // eslint-disable-next-line no-shadow
  authUser: (state, getters) => getters.user(state.authId),
  // To pass arguments into getters, use Higher Order Functions
  user: (state) => (id) => {
    const currentUser = findById(state.users, id);
    if (!currentUser) {
      return null;
    }
    // `get` keyword will allows access to the methods as normal properties
    // e.g. authUser.posts instead of authUser.posts()
    return {
      ...currentUser,
      get posts() {
        return state.posts.filter((post) => post.userId === currentUser.id);
      },
      get postsCount() {
        return currentUser.postsCount || 0;
      },
      get threads() {
        return state.threads.filter((thread) => thread.userId === currentUser.id);
      },
      get threadsCount() {
        // For users without threads default to 0
        return currentUser.threads?.length ?? 0;
      },
    };
  },
  thread: (state) => (id) => {
    const thread = findById(state.threads, id);
    if (!thread) return {};
    return {
      ...thread,
      get author() {
        return findById(state.users, thread.userId);
      },
      get repliesCount() {
        return thread.posts.length - 1;
      },
      get contributorsCount() {
        return thread.contributors?.length || 0;
      },
    };
  },
};
