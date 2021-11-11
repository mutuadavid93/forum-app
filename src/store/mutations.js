import { upsert, docToResource } from '@/helpers';

export default {
  setItem(state, { resource, item }) {
    upsert(state[resource].items, docToResource(item));
  },

  appendUnsubscribe(state, { unsubscribe }) {
    state.unsubscribes.push(unsubscribe);
  },

  clearAllUnscribes(state) {
    // Once on onSnapshot events are called and done, clean-up
    state.unsubscribes = [];
  },

  clearItems(state, { modules = [] }) {
    modules.forEach((module) => {
      state[module].items = [];
    });
  },
};
