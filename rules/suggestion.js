var _ = require('underscore')._;
var debug = require('debug');
var log = debug('lifeego:log');
var error = debug('lifeego:error');
var mongoose = require( 'mongoose' );

module.exports = {
  description: '发送: 建议+空格+具体内容给我们提建议',
  pattern: /^建议\s*(.+)/i,
  handler: function(info){
    var Suggestion = mongoose.model( 'Suggestion' );
    new Suggestion({content:info.param[1],user:info.uid}).save(function( err, sg, count ){
      if(err)
        error(String(err));
      else
        log(String(sg) + count);
    });
    info.flag = true;
    return "感谢您的建议,我记下来了，我会告诉爸爸们你的建议的！";
  }
};