const Token = require('../models/token');
const crypto = require('crypto');

exports.create = (userId)=>{
    return new Promise((resolve,reject)=>{
        let token = new Token({_userId: userId, token: crypto.randomBytes(16).toString('hex')});
        token.save().then(newToken=>{
            if(!newToken){
                reject(new Error('Could not create token'));
            }else{
                resolve(newToken);
            }
        })
        .catch(e=>{reject(e)})
    });
}

exports.retrieve = (token)=>{
    
    return new Promise((resolve, reject)=>{
        Token.findOne({token:token}).then(foundToken=>{
            if(!foundToken){
                reject(new Error("Either broken or expired link, please retry"));
            }else{
                
                resolve(foundToken);
            }
        })
        .catch(e=>{reject(e)});
    });    
}

exports.destroy = (token)=>{
    
    return new Promise((resolve,reject)=>{
        
        Token.findByIdAndDelete(token._id).then(deleted=>{
            
            if(!deleted){
                reject(false);
            }
            resolve(true);
        })
        .catch(e=>{reject(e)});
    })
}