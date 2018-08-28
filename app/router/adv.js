'use strict';
module.exports = app => {
  const { router, controller } = app;
  router.post('/api/postPhoto', controller.adv.postPhoto);
  router.post('/api/insertAdv', controller.adv.insertAdv);
  router.get('/api/getAllAdvs', controller.adv.getAllAdvs);
};
