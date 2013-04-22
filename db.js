var mongoose = require( 'mongoose' );
var Schema   = mongoose.Schema;

var schema = new Schema({
    question   : {type: String, background: true, unique: true},   
    qcount     : {type: Number, default: 1},
    answer     : [{
    				content:    {type: String, background: true, unique: true},
    				user :      String,
    				created_at: {type: Date,default: Date.now}
    			}],
    created_at : {type: Date,   default: Date.now}
});


mongoose.model( 'QA',schema );

schema = new Schema({
    content    : String,   
    user       : String,
    created_at : {type: Date, default: Date.now}
});

mongoose.model( 'Suggestion',schema );

mongoose.connect( 'mongodb://localhost/weixin_robot' );