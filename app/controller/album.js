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
    let storage = parts.field;
    // console.log(storage, files);
    if (storage.deleteList) {
      //如果有删除list的话，那么先删除掉photo表里面的
      let deleteList = storage.deleteList.split(',');
      deleteList.forEach(async item => {
        const photoResult = await this.app.mysql.delete('t_photo', {
          id: item,
        });
      });
      // console.log(deleteList);
    }

    //查出该专辑的star
    // const post = await this.app.mysql.get('t_album', { id: storage.album_id });
    let albumStorage = {
      // star: post.star,
      id: storage.album_id,
      people_id: storage.people_id,
      is_banner: storage.is_banner,
      creatAt: storage.creatAt,
      album_name: storage.album_name,
    };
    const result = await this.app.mysql.update('t_album', albumStorage);
    // 判断更新成功
    const updateSuccess = result.affectedRows === 1;
    //查询全表
    const photos = await this.app.mysql.select('t_photo', {
      where: { album_id: storage.album_id },
    });
    // console.log(photos);
    //更新已经有的图片的is_cover
    photos.forEach(async (item, index) => {
      await this.app.mysql.update('t_photo', {
        id: item.id,
        photo_url: item.photo_url,
        album_id: item.album_id,
        is_cover: index == +storage.coverIndex - 1 ? '1' : '0',
      });
    });
    if (updateSuccess) {
      //新的图片存入图片数据库
      files.forEach(async (item, index) => {
        await this.app.mysql.insert('t_photo', {
          photo_url: `/public/photo/${item}`,
          album_id: storage.album_id,
          is_cover:
            +storage.coverIndex + photos.length - 1 == index ? '1' : '0',
        });
      });
      ctx.body = { success: true, data: storage };
    } else {
      ctx.body = { success: false, data: null };
    }
  }
  async deleteAlbum() {
    const ctx = this.ctx;
    const albumId = ctx.request.body.id;
    const photoResult = await this.app.mysql.delete('t_photo', {
      album_id: albumId,
    });
    const result = await this.app.mysql.delete('t_album', {
      id: albumId,
    });
    const deleteSuccess = result.affectedRows === 1;
    if (deleteSuccess) {
      ctx.body = { success: true };
    } else {
      ctx.body = { success: false, message: '删除失败' };
    }
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
    const albumResult = await this.app.mysql.insert('t_album', {
      people_id: albumStorage.people_id,
      album_name: albumStorage.album_name,
      is_banner: albumStorage.is_banner,
      creatAt: albumStorage.creatAt,
    });
    const insertAlbumSuccess = albumResult.affectedRows === 1;
    if (insertAlbumSuccess) {
      //是否插入成功
      //存入图片数据库
      files.forEach(async (item, index) => {
        await this.app.mysql.insert('t_photo', {
          photo_url: `/public/photo/${item}`,
          album_id: albumResult.insertId,
          is_cover: albumStorage.coverIndex - 1 == index ? 1 : 0,
        });
      });
      ctx.body = { success: true, data: albumStorage };
    } else {
      ctx.body = { success: false, data: null };
    }
  }
}

module.exports = AlbumController;
