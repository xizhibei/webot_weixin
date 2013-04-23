var pwd = process.cwd();
var user = require(pwd + '/lib/user');
var menu = require(pwd + '/conf/menu').takeout;

module.exports = {
  pattern: /^外卖$/i,

  handler: function(info){
  	info.wait('order_meal');
	return menu;
  }
};