import { makeAppendChildToParentMutation } from '@/helpers';

export default {
  namespaced: true,
  state: {
    items: [],
  },
  getters: {},
  actions: {
    fetchForum({ dispatch }, { id }) {
      return dispatch('fetchItem', { emoji: '🏁', resource: 'forums', id }, { root: true });
    },

    fetchForums({ dispatch }, { ids }) {
      return dispatch('fetchItems', { ids, emoji: '🏁', resource: 'forums' }, { root: true });
    },
  },
  mutations: {
    appendThreadToForum: makeAppendChildToParentMutation({ parent: 'forums', child: 'threads' }),
  },
};
