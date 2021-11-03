/* eslint-disable comma-dangle */
import firebase from 'firebase';
import { makeFetchItemAction, makeFetchItemsAction } from '@/helpers';

export default {
  namespaced: true,
  state: {
    items: [],
  },
  getters: {},
  actions: {
    async createPost({ commit, state, rootState }, post) {
      Object.assign(post, {
        publishedAt: firebase.firestore.FieldValue.serverTimestamp(),
        // Access root state under auth module
        userId: rootState.auth.authId,
      });

      const db = firebase.firestore();
      const batch = db.batch();

      // When the document being added doesn't contain an id from firebase,
      // we don't need to pass args to doc() otherwise you must pass an id
      const postRef = db.collection('posts').doc();
      const threadRef = db.collection('threads').doc(post.threadId);
      const userRef = db.collection('users').doc(rootState.auth.authId);

      // Add post into firestore before pushing to vuex store
      batch.set(postRef, post);
      batch.update(threadRef, {
        // Append the new id to the existing array of posts' ids in firebase
        posts: firebase.firestore.FieldValue.arrayUnion(postRef.id),
        contributors: firebase.firestore.FieldValue.arrayUnion(rootState.auth.authId),
      });
      batch.update(userRef, {
        // increment postcount whenever authenticated user adds a post
        postsCount: firebase.firestore.FieldValue.increment(1),
      });
      await batch.commit();
      const newPost = await postRef.get();

      commit(
        'setItem',
        {
          resource: 'posts',
          item: { ...newPost.data(), id: newPost.id },
        },
        { root: true }
      );
      commit(
        'threads/appendPostToThread',
        {
          childId: newPost.id,
          parentId: post.threadId,
        },
        { root: true }
      );
      commit(
        'threads/appendContributorToThread',
        {
          childId: rootState.auth.authId,
          parentId: post.threadId,
        },
        { root: true }
      );
    },

    async updatePost({ commit, state, rootState }, { text, id }) {
      const post = {
        text,
        edited: {
          at: firebase.firestore.FieldValue.serverTimestamp(),
          by: rootState.auth.authId,
          moderated: false,
        },
      };
      const postRef = firebase
        .firestore()
        .collection('posts')
        .doc(id);
      await postRef.update(post);
      const updatedPost = await postRef.get();
      commit('setItem', { resource: 'posts', item: updatedPost }, { root: true });
    },

    // fetchPost({ dispatch }, { id }) {
    //   return dispatch('fetchItem', { id, emoji: '🦈', resource: 'posts' }, { root: true });
    // },

    // fetchPosts({ dispatch }, { ids }) {
    //   return dispatch('fetchItems', { ids, emoji: '🦈', resource: 'posts' }, { root: true });
    // },
    fetchPost: makeFetchItemAction({ emoji: '💬', resource: 'posts' }),
    fetchPosts: makeFetchItemsAction({ emoji: '💬', resource: 'posts' }),
  },
  mutations: {},
};
