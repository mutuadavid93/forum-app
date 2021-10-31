/* eslint-disable comma-dangle */
import firebase from 'firebase';

export default {
  namespaced: true,
  state: {
    authId: null,
    authUserUnsubscribe: null,
    authObserverUnsubscribe: null,
  },
  getters: {
    // eslint-disable-next-line no-shadow
    // @syntax:: module/getter
    authUser: (state, getters, rootState, rootGetters) => rootGetters['users/user'](state.authId),
  },
  actions: {
    initAuthentication({ dispatch, commit, state }) {
      // Unsubscribe from existing observers
      if (state.authObserverUnsubscribe) state.authObserverUnsubscribe();

      return new Promise((resolve) => {
        // Use onAuthStateChanged Observer. When it changes, there should be a signed in user
        // Turn off the observer when you leave a page and fire a new one(remove orphan observers)
        const unsubscribe = firebase.auth().onAuthStateChanged(async (user) => {
          dispatch('unsubscribeAuthUserSnapshot');

          // Make sure to wait for the user to be fetched first
          if (user) {
            await dispatch('fetchAuthUser');
            resolve(user);
          } else {
            resolve(null);
          }
        });
        commit('setAuthObserverUnsubscribe', unsubscribe);
      });
    },

    // prettier-ignore
    async registerUserWithEmailAndPassword(
      { dispatch },
      // eslint-disable-next-line comma-dangle
      // eslint-disable-next-line object-curly-newline
      { avatar = null, email, name, username, password },
    ) {
      const result = await firebase.auth().createUserWithEmailAndPassword(email, password);
      // eslint-disable-next-line object-curly-newline
      await dispatch('users/registerUser', { id: result.user.uid, email, name, username, avatar }, { root: true });
    },

    signInWithEmailAndPassword(context, { email, password }) {
      return firebase.auth().signInWithEmailAndPassword(email, password);
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

      if (!userDoc.exists) {
        return dispatch(
          'users/createUser',
          {
            id: user.uid,
            name: user.displayName,
            email: user.email,
            username: user.email,
            avatar: user.photoURL,
          },
          { root: true }
        );
      }
    },

    async signOut({ commit }) {
      await firebase.auth().signOut();
      commit('setAuthId', null);
    },

    fetchAuthUser: async ({ dispatch, commit }) => {
      const userId = firebase.auth().currentUser?.uid;
      if (!userId) return;
      await dispatch(
        'fetchItem',
        {
          emoji: '🙋',
          resource: 'users',
          id: userId,
          handleUnsubscribe: (unsubscribe) => {
            commit('setAuthUserUnsubscribe', unsubscribe);
          },
        },
        { root: true }
      );
      commit('setAuthId', userId);
    },

    async fetchAuthUsersPosts({ commit, state }, { startAfter }) {
      // limit(number)
      // startAfter(doc), where to start
      // orderBy()
      let query = await firebase
        .firestore()
        .collection('posts')
        .where('userId', '==', state.authId)
        .orderBy('publishedAt', 'desc')
        .limit(3);

      // For the first page startAfter is null
      if (startAfter) {
        // Get the actual document from firestore
        const doc = await firebase
          .firestore()
          .collection('posts')
          .doc(startAfter.id)
          .get();
        query = query.startAfter(doc);
      }
      const posts = await query.get(); // get() executes the query

      // Update state
      posts.forEach((item) => {
        commit('setItem', { resource: 'posts', item }, { root: true });
      });
    },

    async unsubscribeAuthUserSnapshot({ state, commit }) {
      if (state.authUserUnsubscribe) {
        state.authUserUnsubscribe();
        commit('setAuthUserUnsubscribe', null);
      }
    },
  },
  mutations: {
    setAuthId(state, id) {
      state.authId = id;
    },

    setAuthUserUnsubscribe(state, unsubscribe) {
      state.authUserUnsubscribe = unsubscribe;
    },

    setAuthObserverUnsubscribe(state, unsubscribe) {
      state.authObserverUnsubscribe = unsubscribe;
    },
  },
};
