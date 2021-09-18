import { createStore } from 'vuex';
import sourceData from '@/seed.json';
import { findById, upsert } from '@/helpers';

const getters = {
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
        return this.posts.length;
      },
      get threads() {
        return state.threads.filter((thread) => thread.userId === currentUser.id);
      },
      get threadsCount() {
        return this.threads.length;
      },
    };
  },
  thread: (state) => (id) => {
    const thread = findById(state.threads, id);
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

// Higher order functions to create mutations
const makeAppendChildToParentMutation = ({ parent, child }) => (state, { childId, parentId }) => {
  const resource = findById(state[parent], parentId);
  // make sure a posts property exists in a resource
  resource[child] = resource[child] || [];

  // Only push if it's a unique id
  if (!resource[child].includes(childId)) {
    resource[child].push(childId);
  }
};

const mutations = {
  setPost(state, { post }) {
    upsert(state.posts, post);
  },
  setUser(state, { user, userId }) {
    const userIndex = state.users.findIndex((u) => u.id === userId);
    state.users[userIndex] = user;
  },
  setThread(state, { thread }) {
    upsert(state.threads, thread);
  },
  // Closures are Higher order functions in a nutshell :)
  appendPostToThread: makeAppendChildToParentMutation({ parent: 'threads', child: 'posts' }),
  appendThreadToForum: makeAppendChildToParentMutation({ parent: 'forums', child: 'threads' }),
  appendThreadToUser: makeAppendChildToParentMutation({ parent: 'users', child: 'threads' }),
  appendContributorToThread: makeAppendChildToParentMutation({
    parent: 'threads',
    child: 'contributors',
  }),
};

const actions = {
  createPost({ commit, state }, post) {
    Object.assign(post, {
      id: `Hangul_${Math.random()}`,
      publishedAt: Math.floor(Date.now() / 1000),
      userId: state.authId,
    });
    commit('setPost', { post });
    commit('appendPostToThread', { childId: post.id, parentId: post.threadId });
    commit('appendContributorToThread', { childId: state.authId, parentId: post.threadId });
  },

  updateUser({ commit }, user) {
    commit('setUser', { user, userId: user.id });
  },

  // You can have promise based actions thus when dispatching it, you can await
  // and grab the returned value.
  async createThread({ commit, state, dispatch }, { title, text, forumId }) {
    const id = `Hangul_${Math.random()}`;
    const userId = state.authId;
    const publishedAt = Math.floor(Date.now() / 1000);
    // prettier-ignore
    const thread = {
      forumId, title, publishedAt, userId, id,
    };
    commit('setThread', { thread });
    commit('appendThreadToUser', { parentId: userId, childId: id });
    commit('appendThreadToForum', { parentId: forumId, childId: id });
    dispatch('createPost', { text, threadId: id });

    return findById(state.threads, id);
  },

  async updateThread({ commit, state }, { title, text, id }) {
    const thread = findById(state.threads, id);
    const post = findById(state.posts, thread.posts[0]);

    // NB:: The found thread should not be directly mutated
    const newThread = { ...thread, title };
    const newPost = { ...post, text };
    commit('setThread', { thread: newThread });
    commit('setPost', { post: newPost });
    return newThread;
  },
};

export default createStore({
  state: { ...sourceData, authId: 'ALXhxjwgY9PinwNGHpfai6OWyDu2' },
  getters,
  mutations,
  actions,
});
