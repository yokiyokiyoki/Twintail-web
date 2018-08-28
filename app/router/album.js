'use strict';
module.exports = app => {
  const { router, controller } = app;
  router.post('/api/insertAlbum', controller.album.insertAlbum);
  router.get('/api/getAlbumDetail', controller.album.getAlbumDetail);
  router.get('/api/getAllAlbums', controller.album.getAllAlbums);
};
