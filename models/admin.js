const mongoose = require('mongoose');
const User = mongoose.model('User');

const options = {discriminatorKey:'kind'};

const Admin = User.discriminator(
    'Admin',
    new mongoose.Schema({
        admin:Boolean,
        reportedAds:[{type:mongoose.Schema.Types.ObjectId,ref:'Ad'}]
    }),
    options
);

module.exports = Admin;