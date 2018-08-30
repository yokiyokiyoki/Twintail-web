'use strict';

const fs = require('fs');
const path = require('path');
const Controller = require('egg').Controller;
const pump = require('mz-modules/pump');

class AlbumController extends Controller {
  async addAlbumStar() {
    //加星星
    const ctx = this.ctx;
    const albumId = ctx.request.body.id;
    const results = await this.app.mysql.query(
      'update t_album set star = (star + ?) where id = ?',
      [1, albumId]
    );
    const updateSuccess = results.affectedRows === 1;
    if (updateSuccess) {
      ctx.body = { success: true };
    } else {
      ctx.body = { success: false, message: '添加star失败' };
    }
  }
  async getAlbumDetail() {
    //查某个写真集的详细信息
    const ctx = this.ctx;
    const albumId = ctx.query.id;
    const album = await ctx.service.album.findDetail(albumId);
    ctx.body = { success: true, data: album };
  }
  async getAllAlbums() {
    //获取所有写真集
    const ctx = this.ctx;
    const albums = await this.app.mysql.select('t_album');
    let result = [];
    for (let i = 0; i < albums.length; i++) {
      let album = await ctx.service.album.findDetail(albums[i].id);
      result.push(album);
    }
    result = result.sort((a, b) => {
      return a.info.creatAt < b.info.creatAt;
    });
    ctx.body = { success: true, data: result };
  }
  async updateAlbum() {
    const ctx = this.ctx;
  }
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
    //看看数据库里面有没有相同名字的,如果存在则不添加
    const albums = await this.app.mysql.select('t_album');

    let isExist = albums.some((item, index) => {
      return item.album_name == parts.field.album_name;
    });
    if (isExist) {
      ctx.body = { success: false, message: '该名字已经存在' };
      return;
    }
    // console.log(isExist);
    const albumResult = await this.app.mysql.insert('t_album', albumStorage);
    const insertAlbumSuccess = albumResult.affectedRows === 1;
    if (insertAlbumSuccess) {
      //是否插入成功
      //存入图片数据库
      files.forEach(async (item, index) => {
        await this.app.mysql.insert('t_photo', {
          photo_url: `/public/photo/${item}`,
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
