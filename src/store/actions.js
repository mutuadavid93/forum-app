/* eslint-disable object-curly-newline */
import firebase from 'firebase';
import { findById, docToResource } from '@/helpers';

export default {
  initAuthentication({ commit, state }) {
    // Unsubscribe from existing observers
    if (state.authObserverUnsubscribe) state.authObserverUnsubscribe();

    return new Promise((resolve) => {
      // Use onAuthStateChanged Observer. When it changes, there should be a signed in user
      // Turn off the observer when you leave a page and fire a new one(remove orphan observers)
      const unsubscribe = firebase.auth().onAuthStateChanged(async (user) => {
        this.dispatch('unsubscribeAuthUserSnapshot');

        // Make sure to wait for the user to be fetched first
        if (user) {
          await this.dispatch('fetchAuthUser');
          resolve(user);
        } else {
          resolve(null);
        }
      });
      commit('setAuthObserverUnsubscribe', unsubscribe);
    });
  },

  // Authenticating Users via 3rd Party Providers
  // eslint-disable-next-line consistent-return
  async signInWithGoogle({ dispatch, commit }) {
    const provider = new firebase.auth.GoogleAuthProvider();
    const response = await firebase.auth().signInWithPopup(provider);
    const { user } = response;
    const userRef = firebase
      .firestore()
      .collection('users')
      .doc(user.uid);
    const userDoc = await userRef.get();

    console.log('---- user exists ', userDoc.exists, userDoc);

    if (!userDoc.exists) {
      return dispatch('createUser', {
        id: user.uid,
        name: user.displayName,
        email: user.email,
        username: user.email,
        avatar: user.photoURL,
      });
    }
  },

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

  async registerUserWithEmailAndPassword(
    { dispatch },
    // eslint-disable-next-line comma-dangle
    { avatar = null, email, name, username, password }
  ) {
    const result = await firebase.auth().createUserWithEmailAndPassword(email, password);
    await dispatch('registerUser', { id: result.user.uid, email, name, username, avatar });
  },

  signInWithEmailAndPassword(context, { email, password }) {
    return firebase.auth().signInWithEmailAndPassword(email, password);
  },

  async signOut({ commit }) {
    await firebase.auth().signOut();
    commit('setAuthId', null);
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

  async fetchAuthUsersPosts({ commit, state }) {
    const posts = await firebase
      .firestore()
      .collection('posts')
      .where('userId', '==', state.authId)
      .get(); // get() executes the query

    // Update state
    posts.forEach((item) => {
      commit('setItem', { resource: 'posts', item });
    });
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

  async fetchAuthUser({ dispatch, commit }) {
    // Get the auth user id from firebase directly
    const userId = firebase.auth().currentUser?.uid;
    if (!userId) return;
    await dispatch('fetchItem', {
      id: userId,
      emoji: '🧛‍♂️',
      resource: 'users',
      handleUnsubscribe: (unsubscribe) => {
        commit('setAuthUserUnsubscribe', unsubscribe);
      },
    });
    commit('setAuthId', userId);
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

  fetchItem({ commit }, { id, resource, handleUnsubscribe = null }) {
    const db = firebase.firestore();
    return new Promise((resolve) => {
      const unsubscribe = db
        .collection(resource)
        .doc(id)
        .onSnapshot((doc) => {
          if (doc.exists) {
            const item = { ...doc.data(), id: doc.id };
            commit('setItem', { resource, item });
            resolve(item);
          } else {
            resolve(null);
          }
        });

      if (handleUnsubscribe) {
        handleUnsubscribe(unsubscribe);
      } else {
        commit('appendUnsubscribe', { unsubscribe });
      }
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

  async unsubscribeAuthUserSnapshot({ state, commit }) {
    if (state.authUserUnsubscribe) {
      state.authUserUnsubscribe();
      commit('setAuthUserUnsubscribe', null);
    }
  },
};
