// NB:: Registering the vpagination separately is only for good practice to
// keep all third-party libraries organized inside plugins folder

import VPagination from '@hennge/vue3-pagination';
import '@hennge/vue3-pagination/dist/vue3-pagination.css';

export default (app) => {
  // Register the pagination component of app instance
  app.component('VPagination', VPagination);
};
