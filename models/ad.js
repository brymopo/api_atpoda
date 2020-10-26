const mongoose = require('mongoose');
const Schema    = mongoose.Schema;

const adSchema = new Schema({
    pet:{type:mongoose.Schema.Types.ObjectId,ref:'Pet'},
    conversations:[{type:mongoose.Schema.Types.ObjectId,ref:'Conversation'}],
    createdAt:{type:Date,default:Date.now, expires:60*60*24*30}
})

module.exports = mongoose.model('Ad',adSchema);