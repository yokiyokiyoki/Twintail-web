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

    console.log(ctx.request.body, files, parts.field, storage);
    const result = await this.app.mysql.insert('t_people', storage);
    const insertSuccess = result.affectedRows === 1;
    if (insertSuccess) {
      //是否插入成功
      ctx.body = { success: true, data: storage };
    } else {
      ctx.body = { success: false, data: null };
    }
  }
}

module.exports = UserController;
