'use strict';
module.exports = app => {
  const { router, controller } = app;
  router.get('/api/getUser', controller.user.getUser);
};
