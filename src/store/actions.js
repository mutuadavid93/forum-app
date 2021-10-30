/* eslint-disable object-curly-newline */
import firebase from 'firebase';
import { docToResource } from '@/helpers';

export default {

  // ---------------------------------------
  // Fetch Single Resource
  // ---------------------------------------

  // ---------------------------------------
  // Fetch Multiple Resources
  // ---------------------------------------

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
};
