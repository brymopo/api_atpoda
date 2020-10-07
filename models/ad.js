const mongoose = require('mongoose');
const Schema    = mongoose.Schema;

const adSchema = new Schema({
    pet:{type:mongoose.Schema.Types.ObjectId,ref:'Pet'},
    conversations:[{type:mongoose.Schema.Types.ObjectId,ref:'Conversation'}]
})

module.exports = mongoose.model('Ad',adSchema);