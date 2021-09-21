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
