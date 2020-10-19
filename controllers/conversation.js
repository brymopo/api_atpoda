const mongoose = require('mongoose');
const User =    require('mongoose').model('User');
const Message = require('../models/message');
const Conversation = require('../models/conversation');

exports.getConversations = (userId)=>{
    return new Promise((resolve,reject)=>{
        User.findById(userId)
        .populate('conversations')
        .exec()        
        .then(user=>{
            if(!user){
                resolve([]);
            }
            Conversation.populate(user.conversations,{path:'messages'})            
            .then(c=>{
                resolve(c)
            })
            
        })
        .catch(e=>{reject(e)})
    })
    
}

exports.showConversation = (convID)=>{
    return new Promise((resolve,reject)=>{
        Conversation.findById(convID)
        .populate('messages')
        .exec()
        .then(foundConv=>{
            if(foundConv){
                resolve(foundConv)
            }
        })
        .catch(e=>{reject(e)})
    })
    
}

