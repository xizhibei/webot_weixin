var express = require('express');
var webot = require('weixin-robot');
var fanjian = require('./lib/fanjian');
var memcached = require('./lib/memcached');
var messages = require('./data/messages');
var conf = require('./conf');

var log = require('debug')('webot:lifeego:log');

// 启动服务
var app = express();
var path = require('path');
require('./db.js');

webot.codeReplies = messages;//fail messages
webot.config.beforeSend = function(err, info, next) {
  if (err == 404 && info.param.start) {
    info.reply = messages['NO_MORE'];
  } else if (err || !info.reply) {
    //res.statusCode = (typeof err === 'number' ? err : 500);
    info.reply = info.reply || messages[String(err)] || messages['503'];
  }

  // if (Array.isArray(info.reply)) {
  //   if (info.has_more) {
  //     info.reply.push({
  //       title: '回复 more 查看更多...',
  //       picUrl: '',
  //       url: '',
  //     });
  //   }
  // }

  if (!info.is_zht) return next();

  fanjian.zhs2zht(info.reply, function(ret) {
    info.reply = ret || info.reply;
    next();
  });
};


// load rules
require('./rules')(webot);


app.engine('jade', require('jade').__express);
app.set('view engine', 'jade');
app.set('views', __dirname + '/templates');

app.use(express.cookieParser());
app.use(express.session({ secret: conf.salt, store: new memcached.MemObj('wx_session') }));

app.use(express.static(path.join(__dirname, 'public')));

// 微信后台只允许 80 端口，你可能需要自己做一层 proxy
//app.enable('trust proxy');

// 启动机器人, 接管 web 服务请求
webot.watch(app, { token: conf.WX_TOKEN});

// var manager = require('./lib/manager');
// var auth = express.basicAuth(function(user, pass) {
//   var users = conf.users;
//   return users && (user in users) && users[user]['passwd'] === pass;
// });
// app.get('/admin', auth, manager.menu, manager.home(webot));
// app.get('/admin/:sub', auth, manager.menu, manager.panel(webot));


app.listen(conf.PORT, function(){
  log("Listening on %s", conf.PORT);
});

if(!process.env.DEBUG){
  log("set env variable `DEBUG=webot-example:*` to display debug info.");
}