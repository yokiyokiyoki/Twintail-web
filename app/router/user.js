'use strict';
module.exports = app => {
  const { router, controller } = app;
  router.get('/getAllUsers', controller.user.getAllUsers);
  router.get('/getUser', controller.user.getUser);
  router.post('/insertUser', controller.user.insertUser);
};
