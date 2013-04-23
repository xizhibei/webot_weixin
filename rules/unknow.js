var _ = require('underscore')._;
var debug = require('debug');
var log = debug('webot:lifeego:log');
var error = debug('webot:lifeego:error');
var mongoose = require( 'mongoose' );

module.exports = {
  pattern: /.*/,
  handler: function(info,next){
    var QA = mongoose.model( 'QA' );
    QA.findOne({question:info.text},function( err, qa, count ){
      if(qa == null){
        new QA({question:info.text}).save(function( err, qa, count ){
          if(err)
            log(String(err));
          else
            log(String(qa) + count);
        });
        next(null,'o(︶︿︶)o 唉~我太笨了，听不懂你在说什么，回复“调教+空格+问题+空格+答案”教我回答吧！');
      }
      else{
        qa.qcount = qa.qcount + 1;
        qa.save(function( err, qa, count ){
          if(err)
            log(String(err));
          else
            log(String(qa) + count);
        });
        msg = qa.answer[_.random(0,qa.answer.length-1)].content;
        log("Get ans: " + msg);
        next(null,msg);
      }
    });
  }
};