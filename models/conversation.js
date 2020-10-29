const mongoose = require('mongoose');
const Schema = mongoose.Schema;

function sizeLimit(val){
    return val.length < 3;
}

let conversationSchema = new Schema({    
    participants:{
        type:[{type:mongoose.Schema.Types.ObjectId,ref:'User'}],
        validate:[sizeLimit,'There cannot be more than 2 participants']
    },
    messages:[{type:mongoose.Schema.Types.ObjectId,ref:'Message'}],
    pet: {type:mongoose.Schema.Types.ObjectId,ref:'Pet'}
})

module.exports = mongoose.model('Conversation',conversationSchema);