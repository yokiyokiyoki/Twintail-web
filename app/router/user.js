'use strict';
module.exports = app => {
  const { router, controller } = app;
  router.get('/api/getAllUsers', controller.user.getAllUsers);
  router.get('/api/getUser', controller.user.getUser);
  router.post('/api/insertUser', controller.user.insertUser);
  router.post('/api/deleteUser', controller.user.deleteUser);
};
