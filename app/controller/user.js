'use strict';
const fs = require('fs');
const path = require('path');
const Controller = require('egg').Controller;
const pump = require('mz-modules/pump');

class UserController extends Controller {
  async getUser() {
    const ctx = this.ctx;
    const userId = ctx.query.id;
    const user = await ctx.service.user.find(userId);
    if (user) {
      ctx.body = { data: user, success: true };
    } else {
      ctx.body = { data: null, success: false };
    }
  }
  async getAllUsers() {
    const ctx = this.ctx;
    const result = await this.app.mysql.select('t_people');
    if (result) {
      if (result.length) {
        ctx.body = { data: result, success: true };
      } else {
        ctx.body = { data: [result], success: true };
      }
    } else {
      ctx.body = { data: null, success: false };
    }
  }
  async insertUser() {
    const ctx = this.ctx;
    const parts = this.ctx.multipart({ autoFields: true });
    const files = [];
    let stream;
    while ((stream = await parts()) != null) {
      const filename = stream.filename.toLowerCase();
      const target = path.join(
        this.config.baseDir,
        'app/public/tx_pic',
        filename
      );
      const writeStream = fs.createWriteStream(target);
      await pump(stream, writeStream);
      files.push(filename);
    }
    let storage = { ...parts.field, tx_pic: `/public/tx_pic/${files[0]}` };

    //看看数据库里面有没有相同名字的,如果存在则不添加
    const albums = await this.app.mysql.select('t_people');

    let isExist = albums.some((item, index) => {
      return item.username == parts.field.username;
    });
    if (isExist) {
      ctx.body = { success: false, message: '该名字已经存在' };
      return;
    }

    const result = await this.app.mysql.insert('t_people', storage);
    const insertSuccess = result.affectedRows === 1;
    if (insertSuccess) {
      //是否插入成功
      ctx.body = { success: true, data: storage };
    } else {
      ctx.body = { success: false, data: null };
    }
  }
  async updateUser() {
    const ctx = this.ctx;
    const userId = ctx.request.body.id;
  }
  async deleteUser() {
    const ctx = this.ctx;
    const userId = ctx.request.body.id;
    const albumResult = await this.app.mysql.select('t_album', {
      where: { people_id: userId },
    });
    // console.log(albumResult);
    for (let i = 0; i < albumResult.length; i++) {
      let photoResult = await this.app.mysql.delete('t_photo', {
        album_id: albumResult[i].id,
      });
    }
    for (let i = 0; i < albumResult.length; i++) {
      const result = await this.app.mysql.delete('t_album', {
        id: albumResult[i].id,
      });
    }
    const result = await this.app.mysql.delete('t_people', {
      id: userId,
    });
    const deleteSuccess = result.affectedRows === 1;
    if (deleteSuccess) {
      ctx.body = { success: true };
    } else {
      ctx.body = { success: false, message: '删除失败' };
    }
  }
}

module.exports = UserController;
