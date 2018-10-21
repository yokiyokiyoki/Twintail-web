'use strict';
const fs = require('fs');
const path = require('path');
const Controller = require('egg').Controller;
const pump = require('mz-modules/pump');

class AdvController extends Controller {
  async getAllAdvs() {
    const ctx = this.ctx;
    const result = await this.app.mysql.select('t_adv');
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
  async getAdvDetail() {
    const ctx = this.ctx;
    const advId = ctx.query.id;
    const adv = await this.app.mysql.get('t_adv', { id: advId });
    if (adv) {
      ctx.body = { data: adv, success: true };
    } else {
      ctx.body = { data: null, success: false };
    }
  }
  async insertAdv() {
    const ctx = this.ctx;
    const parts = this.ctx.multipart({ autoFields: true });
    const files = [];
    let stream;
    while ((stream = await parts()) != null) {
      const filename = stream.filename.toLowerCase();
      const target = path.join(
        this.config.baseDir,
        'app/public/adv_pic',
        filename
      );
      const writeStream = fs.createWriteStream(target);
      await pump(stream, writeStream);
      files.push(filename);
    }
    let storage = { ...parts.field, photo_url: `/public/adv_pic/${files[0]}` };

    const result = await this.app.mysql.insert('t_adv', storage);
    const insertSuccess = result.affectedRows === 1;
    if (insertSuccess) {
      //是否插入成功
      ctx.body = { success: true, data: storage };
    } else {
      ctx.body = { success: false, data: null };
    }
  }
  async updateAdv() {
    const ctx = this.ctx;
    const parts = this.ctx.multipart({ autoFields: true });
    const files = [];
    let stream;
    while ((stream = await parts()) != null) {
      const filename = stream.filename.toLowerCase();
      const target = path.join(
        this.config.baseDir,
        'app/public/adv_pic',
        filename
      );
      const writeStream = fs.createWriteStream(target);
      await pump(stream, writeStream);
      files.push(filename);
    }
    const result = await this.app.mysql.update('t_adv', parts.field);
    const updateSuccess = result.affectedRows === 1;
    if (updateSuccess) {
      ctx.body = { success: true, data: result };
    } else {
      ctx.body = { success: false, message: '更新失败' };
    }
    // ctx.body = 'success';
    console.log(parts.field);
  }
  async deleteAdv() {
    const ctx = this.ctx;
    const advId = ctx.request.body.id;
    const result = await this.app.mysql.delete('t_adv', {
      id: advId,
    });
    const deleteSuccess = result.affectedRows === 1;
    if (deleteSuccess) {
      ctx.body = { success: true };
    } else {
      ctx.body = { success: false, message: '删除失败' };
    }
  }
  async postPhoto() {
    const ctx = this.ctx;
    ctx.body = 'success';
  }
}

module.exports = AdvController;
