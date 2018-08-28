'use strict';

const fs = require('fs');
const path = require('path');
const Controller = require('egg').Controller;
const pump = require('mz-modules/pump');

class AlbumController extends Controller {
  async getAlbum() {}
  async getAllAlbums() {}
  async insertAlbum() {
    const ctx = this.ctx;
    const parts = this.ctx.multipart({ autoFields: true });
    const files = [];
    let stream;
    while ((stream = await parts()) != null) {
      const filename = stream.filename.toLowerCase();
      const target = path.join(
        this.config.baseDir,
        'app/public/photo',
        filename
      );
      const writeStream = fs.createWriteStream(target);
      await pump(stream, writeStream);
      files.push(filename);
    }
    let albumStorage = { ...parts.field };

    const albumResult = await this.app.mysql.insert('t_album', albumStorage);
    const insertAlbumSuccess = albumResult.affectedRows === 1;
    console.log(albumResult);
    if (insertAlbumSuccess) {
      //是否插入成功
      //存入图片数据库
      files.forEach(async (item, index) => {
        await this.app.mysql.insert('t_photo', {
          photo_url: `/public/photo${item}`,
          album_id: albumResult.insertId,
        });
      });
      ctx.body = { success: true, data: albumStorage };
    } else {
      ctx.body = { success: false, data: null };
    }
  }
}

module.exports = AlbumController;
