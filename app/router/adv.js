'use strict';
module.exports = app => {
  const { router, controller } = app;
  router.get('/getUser', controller.user.getUser);
};
