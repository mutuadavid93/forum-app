import { findById, upsert, docToResource } from '@/helpers';

// Higher order functions to create mutations
const makeAppendChildToParentMutation = ({ parent, child }) => (state, { childId, parentId }) => {
  const resource = findById(state[parent], parentId);
  if (!resource) {
    // prettier-ignore
    console.warn(
      `Appending ${child} ${childId} to ${parent} ${parentId} failed because 
      the parent didn't exist`,
    );
    return;
  }

  // make sure a posts property exists in a resource
  resource[child] = resource[child] || [];

  // Only push if it's a unique id
  if (!resource[child].includes(childId)) {
    resource[child].push(childId);
  }
};

export default {
  setItem(state, { resource, item }) {
    upsert(state[resource], docToResource(item));
  },
  appendUnsubscribe(state, { unsubscribe }) {
    state.unsubscribes.push(unsubscribe);
  },
  clearAllUnscribes(state) {
    // Once on onSnapshot events are called and done, clean-up
    state.unsubscribes = [];
  },
  // Closures are Higher order functions in a nutshell :)
  appendPostToThread: makeAppendChildToParentMutation({ parent: 'threads', child: 'posts' }),
  appendThreadToForum: makeAppendChildToParentMutation({ parent: 'forums', child: 'threads' }),
  appendThreadToUser: makeAppendChildToParentMutation({ parent: 'users', child: 'threads' }),
  appendContributorToThread: makeAppendChildToParentMutation({
    parent: 'threads',
    child: 'contributors',
  }),
};
