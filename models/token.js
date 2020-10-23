const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const tokenSchema = new Schema({
    _userId: { type: mongoose.Schema.Types.ObjectId, required: true, ref: 'User' },
    token: { type: String, required: true },
    createdAt: { type: Date, required: true, default: Date.now, expires: 1800 }, 
    code:{type:String,default:""},
    failedAttempts:{type:Number,default:0}
});

module.exports = mongoose.model('Token',tokenSchema);