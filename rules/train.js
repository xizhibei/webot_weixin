var pwd = process.cwd();
var train = require(pwd + '/lib/train');

module.exports = {
	description: '发送: 调教+空格+问题+空格+答案',
	pattern: /^调教\s+(.+)\s+(.+)/i,
	handler: function(info,next){
		train(info.param[1],info.param[2],info.uid,next);
	}
}