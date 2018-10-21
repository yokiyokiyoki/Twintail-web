'use strict';
module.exports = app => {
  const { router, controller } = app;
  router.post('/api/insertAlbum', controller.album.insertAlbum);
  router.get('/api/getAlbumDetail', controller.album.getAlbumDetail);
  router.get('/api/getAllAlbums', controller.album.getAllAlbums);
  router.post('/api/addAlbumStar', controller.album.addAlbumStar);
  router.post('/api/deleteAlbum', controller.album.deleteAlbum);
  router.post('/api/updateAlbum', controller.album.updateAlbum);
};
