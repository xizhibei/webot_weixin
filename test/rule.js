var pwd = process.cwd();
var conf = require(pwd+'/conf');

var should = require('should');

var token = conf.WX_TOKEN;
var port = conf.PORT;

var bootstrap = require('./bootstrap.js');
var makeRequest = bootstrap.makeRequest;
var sendRequest = makeRequest('http://localhost:' + port, token);

var app = require('../app.js');

//公用检测指令
var detect = function(info, err, json, content){
  should.exist(info);
  should.not.exist(err);
  should.exist(json);
  json.should.be.a('object');
  if(content){
    json.should.have.property('Content');
    json.Content.should.match(content);
  }
};

//测试规则
describe('Rule', function(){
  //初始化
  var info = null;
  beforeEach(function(){
    info = {
      sp: 'webot',
      user: 'client',
      type: 'text'
    };
  });

  //测试文本消息
  describe('text', function(){

    it('should pass multi line yaml', function(done){
      info.text = '帮助';
      sendRequest(info, function(err, json){
        detect(info, err, json, /菜单/ );
        done();
      });
    });
    
    it('should return fixed', function(done){
      info.text = '建议 哈哈哈';
      sendRequest(info, function(err, json){
        detect(info, err, json, /感谢/ );
        done();
      });
    });  

     it('should pass poem', function(done){
      info.text = '背诵 春晓';
      sendRequest(info, function(err, json){
        detect(info, err, json, /春曉/ );
        done();
      });
    });  

    it('should return image and text', function(done){
      info.text = '天气';
      sendRequest(info, function(err, json){
        detect(info, err, json);
        json.should.have.property('MsgType', 'news');
        json.should.have.property('FuncFlag', 0);
        json.Articles.item.should.have.length(json.ArticleCount);
        json.Articles.item[0].Title[0].toString().should.match(/哈尔滨/);
        done();
      });
    });

    //检测不匹配指令
    it('should return not_match msg', function(done){
      info.text = '#$%^&!@#$';
      sendRequest(info, function(err, json){
        detect(info, err, json, /太笨了/);
        done();
      });
    });
  });

  //测试dialog消息
 // describe('dialog', function(){
 //   //检测yaml指令
 //   it('should return yaml msg', function(done){
 //     info.text = 'yaml';
 //     sendRequest(info, function(err, json){
 //       detect(info, err, json, /这是一个yaml的object配置/);
 //       done();
 //     });
 //   });
 // });

  //测试wait
  describe('wait', function(){
    //检测sex指令
    it('should pass game', function(done){
      info.text = 'game';
      sendRequest(info, function(err, json){
        detect(info, err, json, /1000/);
        //下次回复
        info.text = 'ok';
        sendRequest(info, function(err, json){
          detect(info, err, json, /你的数字/);
          info.text = 'ok';
          sendRequest(info, function(err, json){
            detect(info, err, json, /你的数字/);
            info.text = 'ok';
            sendRequest(info, function(err, json){
                detect(info, err, json, /你的数字/);
                info.text = 'ok';
                sendRequest(info, function(err, json){
                    detect(info, err, json, /你的数字/);
                    info.text = 'ok';
                    sendRequest(info, function(err, json){
                        detect(info, err, json, /你的数字/);
                        info.text = 'ok';
                        sendRequest(info, function(err, json){
                            detect(info, err, json, /说实话/);
                            done();
                        });
                    });
                });
            });
          });
        });
      });
    });

    it('should pass order', function(done){
      info.text = '订餐';
      sendRequest(info, function(err, json){
        detect(info, err, json, /订餐/);
        //下次回复
        info.text = 'A+张三+13804511234+中午十二点';
        sendRequest(info, function(err, json){
          detect(info, err, json, /确认/);
          info.text = '哈';
          sendRequest(info, function(err, json){
            detect(info, err, json, /取消/);
            done();
          });
        });
      });
    });

    
    it('should contains last word', function(done){
      info.text = '谈情说爱';
      sendRequest(info, function(err, json){
        detect(info, err, json, /爱/ );
        info.text = '什么意思';
        sendRequest(info, function(err, json){
          detect(info, err, json, /爱/);
          done();
        });
      });
    });

  })

    //检测search指令
    it('should return search msg', function(done){
      info.text = '百度 javascript';
      sendRequest(info, function(err, json){
        detect(info, err, json, /百度搜索/);
        done();
      });
    });

  //测试图片
  describe('image', function(){
    //检测check_location指令
    it('should return good hash', function(done){
      info.type = 'image';
      info.pic = 'http://www.baidu.com/img/baidu_sylogo1.gif';
      sendRequest(info, function(err, json){
        detect(info, err, json, /看不懂/);
        done()
      });
    });
  });

  //测试图文消息
  describe('news', function(){
    //检测首次收听指令
    it('should return subscribe message.', function(done){
      info.type = 'event';
      info.event = 'subscribe';
      info.eventKey = '';
      sendRequest(info, function(err, json){
        detect(info, err, json,/小笨笨/);
        done();
      });
    });
  });

//  describe('fallback', function(){
//    it('should add funcflag', function(done){
//      info.type = 'text';
//      info.text = '乱麻乱麻乱麻';
//      sendRequest(info, function(err, json){
//        detect(info, err, json);
//        json.should.have.property('FuncFlag', 1);
//        done();
//      });
//    });
//  });
});
