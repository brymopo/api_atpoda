const mongoose = require('mongoose');
const User =    require('mongoose').model('User');
const Message = require('../models/message');
const Conversation = require('../models/conversation');

function buildMessage(data){    
    
    let newMsg = {
        author:data.author,
        content:data.content,
        timestamp:data.timestamp,
        recepient:data.recepient
    };

    if(data.conversation){
        newMsg.conversation = data.conversation;
    }

    return newMsg
}

exports.createMessage = (data)=>{

    let message = buildMessage(data);

    return new Promise((resolve,reject)=>{
        Message.create(message)
        .then(newMsg=>{
            if(newMsg){
                resolve(newMsg)
            }
        })
        .catch(e=>{reject(e)})
    })
}

exports.createConversation = (msg)=>{
    return new Promise((resolve,reject)=>{
        Conversation.create({
            participants:[msg.author,msg.recepient],
            messages:[msg]
        }).then(conv=>{
            if(conv){
                resolve(conv)
            }
        })
        .catch(e=>{reject(e)})
    })
}

exports.pushMsgToConv = (id,msg)=>{
    return new Promise((resolve,reject)=>{
        Conversation.findById(id)
        .populate('messages')
        .exec()
        .then(conv=>{
            if(conv){
                conv.messages.push(msg);
                conv.save()
                .then(savedConv=>{
                    resolve(savedConv)
                })
                
            }
        })
        .catch(e=>{reject(e)})
    })
}

exports.pushConvToUsers = (conv)=>{
    let participants = conv.participants;
    participants.forEach(userId=>{
        User.findById(userId).then(user=>{
            if(user){
                user.conversations.push(conv);
                user.save();                
            }
        })

    })
}


