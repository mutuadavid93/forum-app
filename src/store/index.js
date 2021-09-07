import { createStore } from 'vuex';
import sourceData from '@/seed.json';
import { findById, upsert } from '@/helpers';

const getters = {
  authUser: (state) => {
    const currentUser = findById(state.users, state.authId);
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
};

const mutations = {
  setPost(state, { post }) {
    upsert(state.posts, post);
  },
  setUser(state, { user, userId }) {
    const userIndex = state.users.findIndex((userx) => userx.id === userId);
    state.users[userIndex] = user;
  },
  appendPostToThread(state, { postId, threadId }) {
    const thread = findById(state.threads, threadId);
    // make sure a posts property exists in a thread
    thread.posts = thread.posts || [];
    thread.posts.push(postId);
  },

  setThread(state, { thread }) {
    upsert(state.threads, thread);
  },
  appendThreadToForum(state, { forumId, threadId }) {
    const forum = findById(state.forums, forumId);
    forum.threads = forum.threads || [];
    forum.threads.push(threadId);
  },
  appendThreadToUser(state, { userId, threadId }) {
    const user = findById(state.users, userId);
    user.threads = user.threads || [];
    user.threads.push(threadId);
  },
};

const actions = {
  createPost({ commit, state }, post) {
    Object.assign(post, {
      id: `Hangul_${Math.random()}`,
      publishedAt: Math.floor(Date.now() / 1000),
      userId: state.authId,
    });
    commit('setPost', { post });
    commit('appendPostToThread', { postId: post.id, threadId: post.threadId });
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
    commit('appendThreadToUser', { userId, threadId: id });
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
  actions,
  mutations,
  getters,
});
