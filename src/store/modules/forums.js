import {
  makeAppendChildToParentMutation,
  makeFetchItemAction,
  makeFetchItemsAction,
} from '@/helpers';

export default {
  namespaced: true,
  state: {
    items: [],
  },
  getters: {},
  actions: {
    // fetchForum({ dispatch }, { id }) {
    //   return dispatch('fetchItem', { emoji: '🏁', resource: 'forums', id }, { root: true });
    // },
    fetchForum: makeFetchItemAction({ emoji: '🏁', resource: 'forums' }),

    // fetchForums({ dispatch }, { ids }) {
    //   return dispatch('fetchItems', { ids, emoji: '🏁', resource: 'forums' }, { root: true });
    // },
    fetchForums: makeFetchItemsAction({ emoji: '🏁', resource: 'forums' }),
  },
  mutations: {
    appendThreadToForum: makeAppendChildToParentMutation({ parent: 'forums', child: 'threads' }),
  },
};
