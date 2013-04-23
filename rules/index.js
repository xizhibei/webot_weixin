var pwd = process.cwd();
var data = require(pwd + '/data');
var cities = data.cities;

var user = require(pwd + '/lib/user');

module.exports = function(webot) {
	require('./waits')(webot);

	[
		'location', 
		'image', 
		'event', 
		'game',
		'parse_loc',
		'takeout',
		'ordermeal',
		'train',
		'suggestion'
	].forEach(function(item) {
		webot.set(item, require('./' + item));
	});

	require('js-yaml');

	var dialog_files = ['basic.yaml', 
		'gags.yaml', 
		'greetings.js', 
		'bad.yaml', 
		'lonely.yaml', 
		'sad.yaml', 
		'flirt.yaml', 
		'emoji.yaml', 
		'short.yaml'];
	webot.dialog(dialog_files.map(function(f) {
		return __dirname + '/dialogs/' + f;
	}));

	[
		'weather', 
		'jielong', 
		'wikisource',
		'baidu',
		'unknow'
	].forEach(function(item) {
		webot.set(item, require('./' + item));
	});
};
