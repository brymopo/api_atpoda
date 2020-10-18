const mongoose = require('mongoose');
const Schema =  mongoose.Schema;

const messageSchema = new Schema({
    author:{type:mongoose.Schema.Types.ObjectId,ref:'User',required:true},
    recepient:{type:mongoose.Schema.Types.ObjectId,ref:'User',required:true},
    content:{type:String,required:true},
    timestamp:Date,
    conversation:{type:mongoose.Schema.Types.ObjectId, ref:'Conversation'}
})

module.exports = mongoose.model('Message',messageSchema);