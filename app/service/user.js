'use strict';
const Service = require('egg').Service;
class UserService extends Service {
  async find(uid) {
    const ctx = this.ctx;
    const post = await this.app.mysql.get('t_people', { id: uid });
    const albums = await this.app.mysql.select('t_album', {
      where: { people_id: uid },
    });
    const res = [];
    for (let i = 0; i < albums.length; i++) {
      const album = await ctx.service.album.findDetail(albums[i].id);
      res.push(album);
    }
    console.log(albums, res);
    return { people: post, albums: res };
  }
}
module.exports = UserService;
