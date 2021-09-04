import { createStore } from 'vuex';
import sourceData from '@/seed.json';

const getters = {
  authUser: (state) => {
    const currentUser = state.users.find((user) => user.id === state.authId);
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
    state.posts.push(post);
  },
  setUser(state, { user, userId }) {
    const userIndex = state.users.findIndex((userx) => userx.id === userId);
    state.users[userIndex] = user;
  },
  appendPostToThread(state, { postId, threadId }) {
    const threadPost = state.threads.find((thread) => thread.id === threadId);
    threadPost.posts.push(postId);
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
};

export default createStore({
  state: { ...sourceData, authId: 'ALXhxjwgY9PinwNGHpfai6OWyDu2' },
  actions,
  mutations,
  getters,
});
