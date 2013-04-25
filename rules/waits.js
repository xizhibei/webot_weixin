var pwd = process.cwd();
var data = require(pwd + '/data');
var parser = require(pwd + '/lib/parser');
var user = require(pwd + '/lib/user');
var weather = require(pwd + '/lib/weather');
var log = require('debug')('webot:lifeego:log');
var _ = require('underscore')._;

var cities = data.cities;
var etypes = data.types;

var takeout = require(pwd + '/conf/menu').takeout;
var ordermeal = require(pwd + '/conf/menu').ordermeal;

module.exports = function(webot) {

  webot.waitRule('wiki_fulltitle', function(uid, info, cb) {
    var kw = info.text;
    var m = kw.match(reg_recite);
    if (m) kw = m[4];
    info.kw = kw;
    webot.get('wikisource').handler(info, cb);
  });

  webot.waitRule('chengyu_jielong_wait', function(info) {
    if(/(什么|什麽|甚么|嘛|啥)(意思|解释|释义)/.test(info.text)){
      var chengyu = require(pwd + '/data').chengyu;
      var q = info.session.jielong;

      delete info.session.jielong;
      var ret = q && chengyu.explain[q];
      if (ret) 
        return '【' + q + '】' + ret;
      return '我也不知道是什么意思呢...';
    }
  });

  webot.waitRule('wait_weather_city', function(info, cb) {
    var loc = info.text;
    var param = parser.listParam(info.text);
    var loc_id = param['loc'];
    if (loc_id && loc_id in cities.id2name) {
      user(info.from).setLoc(loc_id);
      loc = cities.id2name[loc_id]
    }
    weather(loc, function(err, res) {
      if (err || ! res) return cb(err);
      return cb(null, res);
    });
  });

  webot.waitRule('order_takeout', function(info) {
    info.text = info.text.replace(/\s/,'');
    var order = info.text.split('+');
    if(order.length == 5){
      info.session.order = order;
      info.session.order_type = 1;

      var tmp = [
      '请确认您的订单:',
      '种类:     ' + order[0],
      '称呼:     ' + order[1],
      '联系方式: ' + order[2],
      '地址:     ' + order[3],
      '用餐时间: ' + order[4],
      '回复"1" => 确认 "2" => 重新下单 其他任意内容则为取消订单'
      ]

      info.wait('order_confirm');
      return tmp.join('\n');
    }
    return null;
  });

  webot.waitRule('order_confirm', function(info,cb) {

    if(info.text == "1"){
      info.flag = true;
      var Order = require( 'mongoose' ).model('Order');
      if(info.session.order_type == 1){
        order = info.session.order;
        new Order({ 
          order_type:info.session.order_type,
          meal_type : order[0],
          name      : order[1],
          phone     : order[2],
          addr      : order[3],
          use_time  : order[4],
          uid       : info.uid
        }).save(function( err, o, count ){
          if(err)
            error(String(err));
          else
            log(String(o) + count);
          cb(null,"您的订单已经转交给我的大大们了，我们会尽快处理，然后通知您的");
        });
      }else{
        order = info.session.order;
        new Order({ 
          order_type: info.session.order_type,
          meal_type : order[0],
          name      : order[1],
          phone     : order[2],
          use_time  : order[3],
          uid       : info.uid
        }).save(function( err, o, count ){
          if(err)
            error(String(err));
          else
            log(String(o) + count);
          cb(null,"您的订单已经转交给我的大大们了，我们会尽快处理，然后通知您的");
        });
      }
    }else if(info.text == "2"){
      if(info.session.order_type == 1)
        info.wait('order_takeout');
      else
        info.wait('order_meal');
      cb(null,ordermeal);
    }else{
      delete info.session.order;
      delete info.session.order_type;
      cb(null,"已取消订单");
    }
  });

webot.waitRule('order_meal', function(info) {
  info.text = info.text.replace(/\s/,'');
  var order = info.text.split('+');
  if(order.length == 4){
    info.session.order = order;
    info.session.order_type = 2;

    var tmp = [
    '请确认您的订单:',
    '种类:     ' + order[0],
    '称呼:     ' + order[1],
    '联系方式: ' + order[2],
    '用餐时间: ' + order[3],
    '回复"1" => 确认 "2" => 重新下单 其他任意内容则为取消订单'
    ]

    info.wait('order_confirm');
    return tmp.join('\n');
  }
  return null;
});

webot.waitRule('game_guess_number',function(info,cb){
      // 用户不想玩了...
      var retryCount = info.session.guess_count;
      log("Guess count: " + retryCount);
      if (info.text != "好了" && 
        info.text != "好" &&
        info.text != "ok") {
        delete info.session.guess_count;
      return cb(null);
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
      delete info.session.guess_count;
      return cb(null);
    }
    info.session.guess_count--;
    info.rewait();
    return cb(null,msg);
  });

webot.set('who_create1', {
  pattern: /你是.+做的/,
  handler: '要我把他的微信号告诉你吗？',
  replies: {
    Y: '好的，他的微信号xizhibei',
    N: '可惜了啊，其实他还长得蛮帅的' 
  }
});
webot.set('who_create2', {
  pattern: function(info) {
    var reg = /(什么人|谁|哪位.*|哪个.*)(给|为|帮)?你?(设置|做|配置|制造|制作|设计|写|创造|生产?)(了|的)?/;
    return reg.test(info.text) && info.text.replace(reg, '').indexOf('你') === 0;
  },
  handler: '一个程序员，要我把他的微信号告诉你吗？',
  replies: {
    Y: '好的，他的微信帐号是：xizhibei',
    N: '可惜了啊，其实他还长得蛮帅的' 
  }
});
}
