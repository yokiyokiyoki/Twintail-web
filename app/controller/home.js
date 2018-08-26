'use strict';

const Controller = require('egg').Controller;

class HomeController extends Controller {
  async index() {
    const user = await this.app.mysql.get('t_people', { id: 1 });
    this.ctx.body = user;
  }
}

module.exports = HomeController;
