/* eslint-disable object-curly-newline */
import firebase from 'firebase';
import { docToResource, makeAppendChildToParentMutation, findById } from '@/helpers';

export default {
  namespaced: true,
  state: {
    items: [],
  },
  getters: {
    // To pass arguments into getters, use Higher Order Functions
    user: (state, getters, rootState) => (id) => {
      const currentUser = findById(rootState.users.items, id);
      if (!currentUser) {
        return null;
      }
      // `get` keyword will allows access to the methods as normal properties
      // e.g. authUser.posts instead of authUser.posts()
      return {
        ...currentUser,
        get posts() {
          return rootState.posts.items.filter((post) => post.userId === currentUser.id);
        },
        get postsCount() {
          return currentUser.postsCount || 0;
        },
        get threads() {
          return rootState.threads.items.filter((thread) => thread.userId === currentUser.id);
        },
        get threadsCount() {
          // For users without threads default to 0
          return currentUser.threads?.length ?? 0;
        },
      };
    },
  },
  actions: {
    async createUser({ commit }, { email, name, username, avatar = null }) {
      const registeredAt = firebase.firestore.FieldValue.serverTimestamp();
      const usernameLower = username.toLowerCase();
      const emailLower = email.toLowerCase();
      const payload = { avatar, email: emailLower, name, username, usernameLower, registeredAt };
      const userRef = await firebase
        .firestore()
        .collection('users')
        .doc();
      userRef.set(payload);
      const newUser = await userRef.get();
      commit('setItem', { resource: 'users', item: newUser }, { root: true });
      return docToResource(newUser);
    },
    async updateUser({ commit }, user) {
      // NB: Firebase doesn't entertain undefined values instead fallback to null
      const updates = {
        avatar: user.avatar || null,
        username: user.username || null,
        name: user.name || null,
        bio: user.bio || null,
        website: user.website || null,
        email: user.email || null,
        location: user.location || null,
      };
      const userRef = firebase
        .firestore()
        .collection('users')
        .doc(user.id);
      // When updating a single record, don't use batch, update it directly
      await userRef.update(updates);
      commit('setItem', { resource: 'users', item: user }, { root: true });
    },

    async registerUser({ commit }, { id, name, username, email, avatar = null }) {
      const registeredAt = firebase.firestore.FieldValue.serverTimestamp();
      const usernameLower = username.toLowerCase();
      const mail = email.toLowerCase();
      const payload = { name, username, email: mail, avatar, registeredAt, usernameLower };
      const userRef = await firebase
        .firestore()
        .collection('users')
        .doc(id);
      userRef.set(payload);
      const newUser = await userRef.get();
      commit('setItem', { resource: 'users', item: newUser });
      return docToResource(newUser);
    },

    fetchUser({ dispatch }, { id }) {
      return dispatch('fetchItem', { id, emoji: '🧛‍♂️', resource: 'users' }, { root: true });
    },

    fetchUsers({ dispatch }, { ids }) {
      return dispatch('fetchItems', { ids, emoji: '🧛‍♂️', resource: 'users' }, { root: true });
    },
  },
  mutations: {
    appendThreadToUser: makeAppendChildToParentMutation({ parent: 'users', child: 'threads' }),
  },
};
