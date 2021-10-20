import { createStore } from 'vuex';
import getters from '@/store/getters';
import actions from '@/store/actions';
import mutations from '@/store/mutations';

const initialState = {
  categories: [],
  forums: [],
  posts: [],
  threads: [],
  users: [],
  // Keep track on events fired by onSnapshot event
  unsubscribes: [],
  // authId: 'fdqFY9kwPGbNkbo9pF86QsRN3dR2',
  authId: null,
  authUserUnsubscribe: null,
  authObserverUnsubscribe: null,
};

export default createStore({
  state: { ...initialState },
  getters,
  mutations,
  actions,
});
