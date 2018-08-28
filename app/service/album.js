'use strict';
const Service = require('egg').Service;
class AlbumService extends Service {
  async findDetail(id) {
    // 获取某个写真集的信息
    const post = await this.app.mysql.get('t_album', { id });
    const photo = await this.app.mysql.select('t_photo', {
      where: { album_id: post.id },
    });
    console.log({ album: post, photo });
    return { album: post, photo };
  }
}
module.exports = AlbumService;
