const Token = require('../models/token');
const crypto = require('crypto');

function generateCode(){
    let code = "";
    let size = Math.floor(Math.random()*3) + 6;
    for (let index = 0; index < size; index++) {
        let digit = Math.floor(Math.random()*10);
        code += digit;        
    }
    return code;
}

exports.create = (userId, twofa)=>{
    return new Promise((resolve,reject)=>{
        let token = new Token({_userId: userId, token: crypto.randomBytes(16).toString('hex')});
        if(twofa){            
            token.code = generateCode();
        };
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

exports.increseFailedAttempts = (token,attempts)=>{
    Token.findByIdAndUpdate(token._id,{failedAttempts:attempts})
    .then(updated=>{
        if(updated){
            console.log('attempts updated...');
        }
    })
    .catch(e=>console.log('Update error: ',e.message));
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