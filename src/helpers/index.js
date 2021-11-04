/* eslint-disable no-param-reassign */
/* eslint-disable import/prefer-default-export */
export const findById = (resources, id) => {
  if (!resources) return null;
  return resources.find((r) => r.id === id);
};

export const upsert = (resources, resource) => {
  const index = resources.findIndex((p) => p.id === resource.id);
  // if the resource exists, we update it else we add it
  if (resource.id && index !== -1) {
    resources[index] = resource;
  } else {
    resources.push(resource);
  }
};

export const docToResource = (doc) => {
  if (typeof doc?.data !== 'function') return doc;
  return { ...doc.data(), id: doc.id };
};

// eslint-disable-next-line arrow-body-style
export const makeAppendChildToParentMutation = ({ parent, child }) => {
  return (state, { childId, parentId }) => {
    const resource = findById(state.items, parentId);
    if (!resource) {
      // prettier-ignore
      console.warn(
        `Appending ${child} ${childId} to ${parent} ${parentId} 
        failed because the parent didn't exist`,
      );
      return;
    }
    resource[child] = resource[child] || [];

    if (!resource[child].includes(childId)) {
      resource[child].push(childId);
    }
  };
};

// eslint-disable-next-line arrow-body-style
export const makeFetchItemAction = ({ emoji, resource }) => {
  return ({ dispatch }, payload) =>
    // eslint-disable-next-line implicit-arrow-linebreak
    dispatch('fetchItem', { emoji, resource, ...payload }, { root: true });
};

// eslint-disable-next-line arrow-body-style
export const makeFetchItemsAction = ({ emoji, resource }) => {
  return ({ dispatch }, payload) =>
    // eslint-disable-next-line implicit-arrow-linebreak
    dispatch('fetchItems', { emoji, resource, ...payload }, { root: true });
};

export const arrayRandom = (array) => {
  const randomIndex = Math.floor(Math.random() * array.length);
  return array[randomIndex];
};
