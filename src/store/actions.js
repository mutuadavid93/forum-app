/* eslint-disable object-curly-newline */
import firebase from '@/helpers/firebase';
import { findById } from '@/helpers';

export default {
  // ---------------------------------------
  // Fetch Single Resource
  // ---------------------------------------

  // ---------------------------------------
  // Fetch Multiple Resources
  // ---------------------------------------

  fetchItem(
    { commit, state },
    { id, resource, handleUnsubscribe = null, once = false, onSnapshot = null },
  ) {
    const db = firebase.firestore();
    return new Promise((resolve) => {
      const unsubscribe = db
        .collection(resource)
        .doc(id)
        .onSnapshot((doc) => {
          // Determine when to unsubscribe from the snapshot ASAP
          if (once) {
            unsubscribe();
          }

          if (doc.exists) {
            const item = { ...doc.data(), id: doc.id };
            let previousItem = findById(state[resource].items, id);
            previousItem = previousItem ? { ...previousItem } : null;
            commit('setItem', { resource, item });

            if (typeof onSnapshot === 'function') {
              // Tip:: Retrieved document has a metadata `hasPendingWrites`
              // which indicates whether the document has local changes that
              // haven't been written to the backend yet.
              const isLocal = doc.metadata.hasPendingWrites;
              onSnapshot({ item: { ...item }, previousItem, isLocal });
            }

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

  fetchItems({ dispatch }, { ids, emoji, resource, onSnapshot = null }) {
    // If no ids provided, default to empty array
    // eslint-disable-next-line no-param-reassign
    ids = ids || [];
    const resourceIds = ids.map((id) => dispatch('fetchItem', { id, emoji, resource, onSnapshot }));
    return Promise.all(resourceIds);
  },

  async unsubscribeAllSnapshots({ state, commit }) {
    state.unsubscribes.forEach((unsubscribe) => unsubscribe());
    commit('clearAllUnscribes');
  },

  clearItems({ commit }, { modules = [] }) {
    commit('clearItems', { modules });
  },
};
