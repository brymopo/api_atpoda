const { Mongoose } = require("mongoose");

const mongoose = require('mongoose');
const Schema   = mongoose.Schema;

const pictureSchema = new Schema({
    format:String
})

mongoose.model('Picture',pictureSchema);