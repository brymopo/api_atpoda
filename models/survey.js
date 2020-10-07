const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const surveySchema = new Schema({
    author:{type:mongoose.Schema.Types.ObjectId,ref:'User'},
    QandA:[]
});

module.exports = mongoose.model('Survey',surveySchema);