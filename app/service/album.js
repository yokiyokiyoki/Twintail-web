'use strict';
const Service = require('egg').Service;
class AlbumService extends Service {
  async findDetail(id) {
    // 获取某个写真集的信息
    const post = await this.app.mysql.get('t_album', { id });
    const people = await this.app.mysql.get('t_people', {
      id: post.people_id,
    });
    const photo = await this.app.mysql.select('t_photo', {
      where: { album_id: post.id },
    });
    return {
      info: {
        ...post,
        username: people.username,
        weibo: people.weibo,
        tx_pic: people.tx_pic,
      },
      photo,
    };
  }
}
module.exports = AlbumService;
