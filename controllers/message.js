const mongoose = require('mongoose');
const User =    require('mongoose').model('User');
const Message = require('../models/message');
const Conversation = require('../models/conversation');



// START OF PROTECTED ROUTES' FUNCTIONS //

/* 

For the routes below, user is presumed to be logged in and in possesion of
a valid JWT containing its user id.

Upon successfully validating the user, a req.user object containing the 
user's id becomes available

*/

