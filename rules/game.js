var pwd = process.cwd();
var user = require(pwd + '/lib/user');

module.exports = {
  pattern: /(?:game|玩?游戏|游戏).*/i,

  handler: function(info){
    info.session.guess_count = 5;
    info.wait('game_guess_number');
    return '让我来猜你的数字吧，想一个1-1000的数字,别跟我说哦，回复: 好了，或者ok';
  }
};