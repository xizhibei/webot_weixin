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

schema = new Schema({
    order_type       : String,
    meal_type        : String,
    name             : String,
    phone            : String,
    addr             : String,
    use_time         : String,
    uid              : String,
    created_at       : {type: Date, default: Date.now}
});

mongoose.model( 'Order',schema );

mongoose.connect( 'mongodb://localhost/weixin_robot' );