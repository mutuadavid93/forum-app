/* eslint-disable comma-dangle */
import firebase from 'firebase';
import chunk from 'lodash/chunk';
import {
  findById,
  docToResource,
  makeAppendChildToParentMutation,
  makeFetchItemAction,
  makeFetchItemsAction,
} from '@/helpers';

export default {
  namespaced: true,
  state: {
    items: [],
  },
  getters: {
    thread: (state, getters, rootState) => (id) => {
      const thread = findById(state.items, id);
      if (!thread) return {};
      return {
        ...thread,
        get author() {
          // Acess root state `users`
          return findById(rootState.users.items, thread.userId);
        },
        get repliesCount() {
          return thread.posts.length - 1;
        },
        get contributorsCount() {
          return thread.contributors?.length || 0;
        },
      };
    },
  },
  actions: {
    // You can have promise based actions thus when dispatching it, you can await
    // and grab the returned value.
    // eslint-disable-next-line object-curly-newline
    async createThread({ commit, state, dispatch, rootState }, { title, text, forumId }) {
      const userId = rootState.auth.authId;
      const publishedAt = firebase.firestore.FieldValue.serverTimestamp();

      const db = firebase.firestore();
      const batch = db.batch();
      const threadRef = db.collection('threads').doc();
      const thread = {
        forumId,
        title,
        publishedAt,
        userId,
        id: threadRef.id,
      };
      const userRef = db.collection('users').doc(userId);
      const forumRef = db.collection('forums').doc(forumId);

      batch.set(threadRef, thread);
      batch.update(userRef, {
        threads: firebase.firestore.FieldValue.arrayUnion(threadRef.id),
      });
      batch.update(forumRef, {
        threads: firebase.firestore.FieldValue.arrayUnion(threadRef.id),
      });
      await batch.commit();
      const newThread = await threadRef.get();

      // NB: If a mutation/action doesn't exist inside the current module, we need to
      // call it with the namespace prefix and provide root argument as the
      // third option.
      // Tip:: If the mutation exists in global namespace then we don't prefix
      commit(
        'setItem',
        {
          resource: 'threads',
          item: { ...newThread.data(), id: newThread.id },
        },
        { root: true }
      );
      commit(
        'users/appendThreadToUser',
        {
          parentId: userId,
          childId: threadRef.id,
        },
        { root: true }
      );
      commit(
        'forums/appendThreadToForum',
        {
          parentId: forumId,
          childId: threadRef.id,
        },
        { root: true }
      );
      await dispatch(
        'posts/createPost',
        {
          text,
          threadId: threadRef.id,
        },
        { root: true }
      );

      return findById(state.items, threadRef.id);
    },

    async updateThread({ commit, state, rootState }, { title, text, id }) {
      const thread = findById(state.items, id);
      const post = findById(rootState.posts.items, thread.posts[0]);
      const db = firebase.firestore();
      const batch = db.batch();
      const threadRef = db.collection('threads').doc(id);
      const postRef = db.collection('posts').doc(post.id);

      // NB:: The found thread should not be directly mutated
      let newThread = { ...thread, title };
      let newPost = { ...post, text };
      batch.update(threadRef, newThread);
      batch.update(postRef, newPost);
      await batch.commit();
      newThread = await threadRef.get();
      newPost = await postRef.get();

      commit('setItem', { resource: 'threads', item: newThread }, { root: true });
      commit('setItem', { resource: 'posts', item: newPost }, { root: true });
      return docToResource(newThread);
    },

    fetchThread: makeFetchItemAction({ emoji: '📄', resource: 'threads' }),

    fetchThreads: makeFetchItemsAction({ emoji: '📄', resource: 'threads' }),

    fetchThreadsByPage({ dispatch, commit }, { ids, page, perPage = 5 }) {
      commit('clearThreads');
      const chunks = chunk(ids, perPage);
      const limitedIds = chunks[page - 1];
      return dispatch('fetchThreads', { ids: limitedIds });
    },
  },
  mutations: {
    appendPostToThread: makeAppendChildToParentMutation({ parent: 'threads', child: 'posts' }),
    appendContributorToThread: makeAppendChildToParentMutation({
      parent: 'threads',
      child: 'contributors',
    }),
    clearThreads(state) {
      state.items = [];
    },
  },
};
