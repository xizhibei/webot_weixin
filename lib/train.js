var debug = require('debug');
var log = debug('lifeego:log');
var mongoose = require( 'mongoose' );

module.exports = exports = function (ques,ans,u,next){
  var QA = mongoose.model( 'QA' );
  QA.findOne({question:ques},function( err, qa, count ){
    if(err){
      log(String(err));
      next(null,"调教失败");
      return;
    }
    if(qa == null){
      new QA({
        question:ques,
        answer:[{content:ans,user:u}]
      }).save(function( err, qa, count ){
        if(err)
          log(String(err));
        else
          log(String(qa) + count);
      });
    }
    else{
      qa.qcount = qa.qcount + 1;

      var exist = false;
      for( var i=0 ; i < qa.answer.length ; ++i ){
        if(qa.answer[i].content == ans){
          exist = true; 
        }
      }

      if(!exist)
        qa.answer.push({content:ans,user:u});

      qa.save(function( err, qa, count ){
        if(err)
          log(String(err));
        else
          log(String(qa) + count);
      });
    }
    next(null,"调教成功");
  });
}