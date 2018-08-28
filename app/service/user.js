'use strict';
const Service = require('egg').Service;
class UserService extends Service {
  async find(uid) {
    const post = await this.app.mysql.get('t_people', { id: uid });
    const album = await this.app.mysql.select('t_album', {
      where: { people_id: uid },
    });

    console.log(album);
    return post;
  }
}
module.exports = UserService;
