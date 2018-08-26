'use strict';
const Service = require('egg').Service;
class UserService extends Service {
  async find(uid) {
    const post = await this.app.mysql.get('t_people', { id: uid });
    return post;
  }
}
module.exports = UserService;
