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
    console.log(ctx.service.user.find, ctx.query);
    if (user) {
      ctx.body = { data: user, success: true };
    } else {
      ctx.body = { data: null, success: false };
    }
  }
  async getAllUsers() {
    const ctx = this.ctx;
    const result = await this.app.mysql.select('t_people');
    console.log(result);
    if (result) {
      if (result.length) {
        ctx.body = { data: result, success: true };
      } else {
        ctx.body = { data: [ result ], success: true };
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

    ctx.body = files;
    console.log(ctx.request.body, files, parts.field);
    // const result = await this.app.mysql.insert('t_people', ctx.request.body);
  }
}

module.exports = UserController;
