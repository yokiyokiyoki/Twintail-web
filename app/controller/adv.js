'use strict';

const Controller = require('egg').Controller;

class AdvController extends Controller {
  async index() {
    const user = await this.app.mysql.get('t_people', { id: 1 });
    this.ctx.body = user;
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

    console.log(ctx.request.body, files, parts.field, storage);
    const result = await this.app.mysql.insert('t_adv', storage);
    const insertSuccess = result.affectedRows === 1;
    if (insertSuccess) {
      //是否插入成功
      ctx.body = { success: true, data: storage };
    } else {
      ctx.body = { success: false, data: null };
    }
  }
}

module.exports = AdvController;
