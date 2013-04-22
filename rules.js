var crypto = require('crypto');

var debug = require('debug');
var log = debug('webot-example:log');
var verbose = debug('webot-example:verbose');
var error = debug('webot-example:error');
var mongoose = require( 'mongoose' );

var _ = require('underscore')._;
var search = require('./support').search;
var geo2loc = require('./support').geo2loc;
var weather = require('./support').weather;

/**
 * 初始化路由规则
 */
module.exports = exports = function(webot){
  var reg_help = /^(菜单|帮助|help|\?)$/i
  webot.set({
    name: 'hello help',
    description: '获取使用帮助，发送 help',
    pattern: function(info) {
      //首次关注时,会收到subscribe event
      return info.event === 'subscribe' || reg_help.test(info.text);
    },
    handler: function(info){
      var reply =
        [ 
          '亲，小笨笨刚刚出生，还什么不懂，如果我答不上来你可以回复“调教+空格+问题+空格+答案”教我哦，',
          '感谢各位亲们的支持，小笨笨为了响应各位的号召，偷偷的给大家增加新功能——“每日订餐了”，'
          '回复“菜单”或者“帮助”可以查看具体的功能指令哦~~'
          '菜单：'
          '1、回复“天气”查看今日天气'
          '2、回复“外卖”查看今日推荐外卖商户，继续操作可订外卖哦'
          '3、回复“订餐”查看今日推荐订餐商户，继续操作可订餐哦'
          '4、回复“游戏”玩玩猜数字的小游戏'
          '5、回复“搜+空格+具体内容”我会帮你百度搜索'
          '6、回复“建议+空格+具体内容”给我们提出宝贵的意见或建议'
        ].join('\n');
      return reply;
    }
  });

  webot.set('weather', {
    description: '发送: tq ',
    pattern: /^(tq|weather|.*天气.*|.*温度)\s*\??$/i,
    handler: function(info, next){
      return weather(next);
    }
  });

  function train(ques,ans,u,next){
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

  webot.set('train', {
    name: 'train',
    description: '发送: 调教+空格+问题+空格+答案',
    pattern: /^调教\s+(.+)\s+(.+)/i,
    handler: function(info,next){
      train(info.query[1],info.query[2],info.user,next);
    }
  });

  webot.set('train2', {
    description: '发送: 调教',
    pattern: /^调教$/,
    handler: function(info,next){
      //等待下一次回复
      var retryCount = 1;
      var question = null;

      webot.wait(info.user, function(replied_info,cb){
        var msg;
        if (retryCount == 1) {
          question = replied_info.text;
          msg = '调教步骤二 => 我该怎样回答呢?';
          retryCount--;
          webot.rewait(info.user);
          cb(null,msg);
        }else{
          train(question,replied_info.text,info.user,cb);
        }
      });
      next(null,'调教有两个步骤，调教步骤一 => 问题是什么?');
    }
  });

  // 简单的纯文本对话，可以用单独的 yaml 文件来定义
  require('js-yaml');
  webot.dialog(__dirname + '/dialog.yaml');

  // 更简单地设置一条规则
  webot.set(/^more$/i, function(info){
    var reply = _.chain(webot.get()).filter(function(rule){
      return rule.description;
    }).map(function(rule){
      //console.log(rule.name)
      return '> ' + rule.description;
    }).join('\n').value();
    
    return '我的主人还没教我太多东西,你可以考虑帮我加下.\n可用的指令:\n'+ reply;
  });

  webot.set({
    name: 'morning',
    description: '打个招呼吧, 发送: good morning',
    pattern: /^(早上?好?|(good )?moring)[啊\!！\.。]*$/i,
    handler: function(info){
      var d = new Date();
      var h = d.getHours();
      if (h < 3) return '[嘘] 我这边还是深夜呢，别吵着大家了';
      if (h < 5) return '这才几点钟啊，您就醒了？';
      if (h < 7) return '早啊官人！您可起得真早呐~ 给你请安了！\n 今天想参加点什么活动呢？';
      if (h < 9) return 'Morning, sir! 新的一天又开始了！您今天心情怎么样？';
      if (h < 12) return '这都几点了，还早啊...';
      if (h < 14) return '人家中午饭都吃过了，还早呐？';
      if (h < 17) return '如此美好的下午，是很适合出门逛逛的';
      if (h < 21) return '早，什么早？找碴的找？';
      if (h >= 21) return '您还是早点睡吧...';
    }
  });

  webot.set({
    name: 'time',
    description: '想知道几点吗? 发送: time',
    pattern: /^(几点了|time)\??$/i,
    handler: function(info) {
      var d = new Date();
      var h = d.getHours();
      var t = '现在是服务器时间' + h + '点' + d.getMinutes() + '分';
      if (h < 4 || h > 22) return t + '，夜深了，早点睡吧 [月亮]';
      if (h < 6) return t + '，您还是再多睡会儿吧';
      if (h < 9) return t + '，又是一个美好的清晨呢，今天准备去哪里玩呢？';
      if (h < 12) return t + '，一日之计在于晨，今天要做的事情安排好了吗？';
      if (h < 15) return t + '，午后的冬日是否特别动人？';
      if (h < 19) return t + '，又是一个充满活力的下午！今天你的任务完成了吗？';
      if (h <= 22) return t + '，这样一个美好的夜晚，有没有去看什么演出？';
      return t;
    }
  });

  // 等待下一次回复
  webot.set('guess my sex', {
    pattern: /是男.还是女.|你.*男的女的/,
    handler: '你猜猜看呐',
    replies: {
      '/女|girl/i': '人家才不是女人呢',
      '/男|boy/i': '是的，我就是翩翩公子一枚',
      'both|不男不女': '你丫才春哥呢',
      '不猜': '[抠鼻]',
      // 请谨慎使用通配符
      '/.*/': function(info) {
        if (info.rewaitCount < 2) {
          webot.rewait(info.user);
          return '你到底还猜不猜嘛！';
        }
        return '看来你真的不想猜啊';
      },
    }
  });

  webot.set('suggestion', {
    name: 'suggestion',
    description: '发送: 建议+空格+具体内容给我们提建议',
    pattern: /^建议\s*(.+)/i,
    handler: function(info){
      var Suggestion = mongoose.model( 'Suggestion' );
      new Suggestion({content:info.query[1],user:info.user}).save(function( err, sg, count ){
        if(err)
          log(String(err));
        else
          log(String(sg) + count);
      });
      return "感谢您的建议,我记下来了，我会告诉爸爸们你的建议的！";
    }
  });

  webot.set('guess number', {
    description: '发送: game , 玩玩猜数字的游戏吧',
    pattern: /(?:game|玩?游戏)\s*(\d*)/,
    handler: function(info){
      //等待下一次回复
      var retryCount = 5;

      webot.wait(info.user, function(replied_info){
        // 用户不想玩了...
        if (replied_info.text != "好了" && 
          replied_info.text != "好" &&
          replied_info.text != "ok") {
          webot.data(info.user. null);
          return null;
        }
        var msg;
        if (retryCount == 5) {
          msg = '将你的数字乘以'+ _.random(2,5) +',回复: 好了，或者ok';
        }else if (retryCount == 4) {
          msg = '然后将你的数字加上'+_.random(2,5)*1000+',回复: 好了，或者ok';
        }else if (retryCount == 3) {
          msg = '然后将你的数字乘以'+_.random(2,5)+',回复: 好了，或者ok';
        }else if (retryCount == 2) {
          msg = '然后将你的数字减去'+_.random(2,5)*1000+',回复: 好了，或者ok';
        }else if (retryCount == 1) {
          msg = '然后将你的数字乘以'+_.random(2,5)+',回复: 好了，或者ok';
        }else if (retryCount == 0) {
          msg = '说实话吧，我猜不到你的数字……谢谢配合[呲牙]';
        }else{
          return null;
        }
        retryCount--;
        //重试
        webot.rewait(info.user);
        return msg;
      });
      return '让我来猜你的数字吧，想一个1-1000的数字,别跟我说哦，回复: 好了，或者ok';
    }
  });

  function do_search(info, next){
    // pattern的解析结果将放在query里
    var q = info.query[1];
    log('searching: ', q);
    // 从某个地方搜索到数据...
    return search(q , next);
  }

  // 可以通过回调返回结果
  webot.set('search', {
    description: '发送: s 关键词 ',
    pattern: /^(?:搜?索?|search|百度|s\b)\s*(.+)/i,
    //handler也可以是异步的
    handler: do_search
  });

  // 对于特殊消息的处理，提供缩写API
  webot.location(function(info, next){
    geo2loc(info, function(err, location, data){
      next(null, location ? '你正在' + location : '我不知道你在什么地方。');
    });
  }, '从地理位置获取城市信息')
  .image(function(info, next){
      verbose('image url: %s', info.pic);
      return '淫家看不懂图片';
  }, '不要发图片哈,淫家看不懂图片');


  // 可以指定图文消息的映射关系
  webot.config.mapping = function(item, index, info){
    //item.title = (index+1) + '> ' + item.title;
    return item;
  };

  //所有消息都无法匹配时的fallback
  webot.set(/.*/, function(info,next){
    // 利用 error log 收集听不懂的消息，以利于接下来完善规则
    // 你也可以将这些 message 存入数据库
    
    var QA = mongoose.model( 'QA' );
    QA.findOne({question:info.text},function( err, qa, count ){
      if(qa == null){
        new QA({question:info.text}).save(function( err, qa, count ){
          if(err)
            log(String(err));
          else
            log(String(qa) + count);
        });
        error('unknown message: %s', info.text);
        info.flag = 1;
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
  });
};
