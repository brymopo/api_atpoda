const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const surveyQuestionSchema = new Schema({
    statements:[String]
});

module.exports = mongoose.model('SurveyQuestion',surveyQuestionSchema);
