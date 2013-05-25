
module.exports = {
  pattern: function(info) {
    return info.is('event');
  },
  handler: function(info, next) {
    if (info.param.event === 'subscribe') {
      return next(null, [ 
          '亲，小笨笨刚刚出生，还什么不懂，如果我答不上来你可以回复“调教+空格+问题+空格+答案”教我哦，',
          '订餐功能可以在我们的网页版http://www.lifeego.com或者手机版http://www.lifeego.com/lifeego.apk实现了',
          '菜单：',
          '1、回复“天气”查看今日天气',
          '2、回复“外卖”查看今日推荐外卖商户，继续操作可订外卖哦',
          '3、回复“订餐”查看今日推荐订餐商户，继续操作可订餐哦',
          '4、回复“游戏”玩玩猜数字的小游戏',
          '5、回复任意成语与小笨笨开始成语接龙',
          '6、回复“百度+空格+具体内容”我会帮你百度搜索',
          '7、回复“建议+空格+具体内容”给我们提出宝贵的意见或建议'
        ].join('\n'))
    } else if (info.param.event === 'unsubscribe') {
      return next(null, '再见!');
    }
    return next(null, '你好');
  }
}
