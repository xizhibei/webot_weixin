var pwd = process.cwd();
var user = require(pwd + '/lib/user');
var menu = require(pwd + '/conf/menu').ordermeal;

module.exports = {
  pattern: /^订餐$/i,

  handler: function(info){
  	info.wait('order_meal');
	return menu;
  }
};