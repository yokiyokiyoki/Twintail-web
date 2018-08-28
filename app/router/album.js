'use strict';
module.exports = app => {
  const { router, controller } = app;
  router.post('/insertAlbum', controller.album.insertAlbum);
  router.get('/getAlbumDetail', controller.album.getAlbumDetail);
  router.get('/getAllAlbums', controller.album.getAllAlbums);
};
