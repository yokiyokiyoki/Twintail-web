'use strict';
module.exports = app => {
  const { router, controller } = app;
  router.post('/insertAdv', controller.adv.insertAdv);
  router.get('/getAllAdvs', controller.adv.getAllAdvs);
};
