/* eslint-disable object-curly-newline */
import firebase from 'firebase';
import { findById, docToResource } from '@/helpers';

export default {
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
    commit('setItem', { resource: 'users', item: newUser });
    return docToResource(newUser);
  },
  async createPost({ commit, state }, post) {
    Object.assign(post, {
      publishedAt: firebase.firestore.FieldValue.serverTimestamp(),
      userId: state.authId,
    });

    const db = firebase.firestore();
    const batch = db.batch();

    // When the document being added doesn't contain an id from firebase,
    // we don't need to pass args to doc() otherwise you must pass an id
    const postRef = db.collection('posts').doc();
    const threadRef = db.collection('threads').doc(post.threadId);
    const userRef = db.collection('users').doc(state.authId);

    // Add post into firestore before pushing to vuex store
    batch.set(postRef, post);
    batch.update(threadRef, {
      // Append the new id to the existing array of posts' ids in firebase
      posts: firebase.firestore.FieldValue.arrayUnion(postRef.id),
      contributors: firebase.firestore.FieldValue.arrayUnion(state.authId),
    });
    batch.update(userRef, {
      // increment postcount whenever authenticated user adds a post
      postsCount: firebase.firestore.FieldValue.increment(1),
    });
    await batch.commit();
    const newPost = await postRef.get();

    commit('setItem', {
      resource: 'posts',
      item: { ...newPost.data(), id: newPost.id },
    });
    commit('appendPostToThread', {
      childId: newPost.id,
      parentId: post.threadId,
    });
    commit('appendContributorToThread', {
      childId: state.authId,
      parentId: post.threadId,
    });
  },

  async updatePost({ commit, state }, { text, id }) {
    const post = {
      text,
      edited: {
        at: firebase.firestore.FieldValue.serverTimestamp(),
        by: state.authId,
        moderated: false,
      },
    };
    const postRef = firebase
      .firestore()
      .collection('posts')
      .doc(id);
    await postRef.update(post);
    const updatedPost = await postRef.get();
    commit('setItem', { resource: 'posts', item: updatedPost });
  },

  updateUser({ commit }, user) {
    commit('setItem', { resource: 'users', item: user });
  },

  // You can have promise based actions thus when dispatching it, you can await
  // and grab the returned value.
  async createThread({ commit, state, dispatch }, { title, text, forumId }) {
    const userId = state.authId;
    const publishedAt = firebase.firestore.FieldValue.serverTimestamp();

    const db = firebase.firestore();
    const batch = db.batch();
    const threadRef = db.collection('threads').doc();
    // prettier-ignore
    const thread = {
      forumId, title, publishedAt, userId, id: threadRef.id,
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

    commit('setItem', {
      resource: 'threads',
      item: { ...newThread.data(), id: newThread.id },
    });
    commit('appendThreadToUser', {
      parentId: userId,
      childId: threadRef.id,
    });
    commit('appendThreadToForum', {
      parentId: forumId,
      childId: threadRef.id,
    });
    await dispatch('createPost', {
      text,
      threadId: threadRef.id,
    });

    return findById(state.threads, threadRef.id);
  },

  async updateThread({ commit, state }, { title, text, id }) {
    const thread = findById(state.threads, id);
    const post = findById(state.posts, thread.posts[0]);
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

    commit('setItem', { resource: 'threads', item: newThread });
    commit('setItem', { resource: 'posts', item: newPost });
    return docToResource(newThread);
  },

  fetchAllCategories({ commit }) {
    const db = firebase.firestore();
    return new Promise((resolve) => {
      db.collection('categories').onSnapshot((querySnapshot) => {
        const categories = querySnapshot.docs.map((doc) => {
          const item = { id: doc.id, ...doc.data() };
          commit('setItem', { resource: 'categories', item });
          return item;
        });
        resolve(categories);
      });
    });
  },

  // ---------------------------------------
  // Fetch Single Resource
  // ---------------------------------------
  fetchCategory({ dispatch }, { id }) {
    return dispatch('fetchItem', { emoji: '🏷', resource: 'categories', id });
  },

  fetchForum({ dispatch }, { id }) {
    return dispatch('fetchItem', { emoji: '🏁', resource: 'forums', id });
  },

  fetchThread({ dispatch }, { id }) {
    return dispatch('fetchItem', { id, emoji: '📄', resource: 'threads' });
  },

  fetchPost({ dispatch }, { id }) {
    return dispatch('fetchItem', { id, emoji: '🦈', resource: 'posts' });
  },

  fetchUser({ dispatch }, { id }) {
    return dispatch('fetchItem', { id, emoji: '🧛‍♂️', resource: 'users' });
  },

  fetchAuthUser({ state, dispatch }) {
    return dispatch('fetchItem', { id: state.authId, emoji: '🧛‍♂️', resource: 'users' });
  },

  // ---------------------------------------
  // Fetch Multiple Resources
  // ---------------------------------------
  fetchCategories({ dispatch }, { ids }) {
    return dispatch('fetchItems', { resource: 'categories', ids, emoji: '🏷' });
  },

  fetchForums({ dispatch }, { ids }) {
    return dispatch('fetchItems', { ids, emoji: '🏁', resource: 'forums' });
  },

  fetchThreads({ dispatch }, { ids }) {
    return dispatch('fetchItems', { ids, emoji: '📄', resource: 'threads' });
  },

  fetchPosts({ dispatch }, { ids }) {
    return dispatch('fetchItems', { ids, emoji: '🦈', resource: 'posts' });
  },

  fetchUsers({ dispatch }, { ids }) {
    return dispatch('fetchItems', { ids, emoji: '🧛‍♂️', resource: 'users' });
  },

  fetchItem({ commit }, { id, emoji, resource }) {
    const db = firebase.firestore();
    return new Promise((resolve) => {
      const unsubscribe = db
        .collection(resource)
        .doc(id)
        .onSnapshot((doc) => {
          console.log('onsnapshot ', id);
          const item = { ...doc.data(), id: doc.id };
          commit('setItem', { resource, item });
          resolve(item);
        });
      commit('appendUnsubscribe', { unsubscribe });
    });
  },

  fetchItems({ dispatch }, { ids, emoji, resource }) {
    const resourceIds = ids.map((id) => dispatch('fetchItem', { id, emoji, resource }));
    return Promise.all(resourceIds);
  },

  async unsubscribeAllSnapshots({ state, commit }) {
    state.unsubscribes.forEach((unsubscribe) => unsubscribe());
    commit('clearAllUnscribes');
  },
};
