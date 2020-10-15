const mongoose = require('mongoose');
const Schema =  mongoose.Schema;

const messageSchema = new Schema({
    author:{type:mongoose.Schema.Types.ObjectId,ref:'User'},
    recepient:{type:mongoose.Schema.Types.ObjectId,ref:'User'},
    content:{type:String,required:true},
    timestamp:Date
})

module.exports = mongoose.model('Message',messageSchema);