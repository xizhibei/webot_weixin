var debug = require('debug');
var log = debug('webot:lifeego:log');
var request = require('request');

var reg_search_cmd = /^(百度|baidu)(一下|搜索|search)?\s*(.+)/i;

function do_search(info, next) {
   var options = {
    url: 'http://www.baidu.com/s',
    qs: {
      wd: info.param[3]
    }
  };

  request.get(options, function(err, res, body) {
    if (err || !body) return next(null, '现在暂时无法搜索，待会儿再来好吗？');

    var reg_h3t = /<h3 class="t">\s*(<a.*?>.*?<\/a>).*?<\/h3>/gi;
    var links = [];
    var i = 1;

    while (true) {
      var m = reg_h3t.exec(body);
      if (!m || i > 5) break;
      links.push(i + '. ' + m[1]);
      i++;
    }

    var ret;
    if (links.length) {
      ret = '在百度搜索到以下结果：\n' + links.join('\n');
      ret = ret.replace(/\s*data-click=".*?"/gi,  '');
      ret = ret.replace(/\s*onclick=".*?"/gi,  '');
      ret = ret.replace(/\s*target=".*?"/gi,  '');
      ret = ret.replace(/<em>(.*?)<\/em>/gi,  '$1');
      ret = ret.replace(/<font.*?>(.*?)<\/font>/gi,  '$1');
      ret = ret.replace(/<span.*?>(.*?)<\/span>/gi,  '$1');
    } else {
      ret = '搜不到任何结果呢';
    }

    next(null, ret);
  });
}
module.exports = {
  'pattern': reg_search_cmd,
  'parser': function(info) {
    info.param.q = info.text.match(reg_search_cmd)[3];
    return info;
  },
  'handler': do_search
};
