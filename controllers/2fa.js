const accountSid = process.env.ACCOUNT_SID;
const authToken = process.env.AUTH_TOKEN;
const Client = require('twilio')(accountSid,authToken);
const Token = require('./token');


const twilioNumber = process.env.TWILIO_NUMBER;

exports.sendSMSCode = (token,user)=>{
        let targetNumber = `+57${user.phone}`;
        
        const sms2FA = {
            body:`Tu codigo ATPODA es: ${token.code}. Valido por 5 minutos`,
            from:twilioNumber,
            to:targetNumber
        };  
        return new Promise( (resolve,reject)=>{
                 
            Client.messages.create(sms2FA).then(message=>{
                if(!message){
                        Token.destroy(token);
                        reject(new Error('Could not send message, please try again'));
                }else{
                    resolve({
                        requestId:token.token,
                        userId:user._id 
                    });
                }
            })
            .catch(e=>{reject(e)})
                      
        })
}

exports.createCode = (user)=>{   
                
    return new Promise(async (resolve,reject)=>{
        try {
            let tokenExists = await Token.retrieveByUserId(user._id);
            let token = tokenExists? tokenExists: await Token.create(user._id,true);
            resolve(token);
        } catch (error) {
            reject(error);
        }
    })    
        
};

exports.verifyCode = (body)=>{
    
    return new Promise((resolve,reject)=>{
        Token.retrieve(body.requestId).then(token=>{
            if(token.code == body.code){
                Token.destroy(token);
                resolve(true);
            }else{
                let attempts = token.failedAttempts + 1;
                if(attempts>=3){
                    Token.destroy(token);
                    reject(new Error('Aborted, too many failed attempts'));
                }else{
                    Token.increseFailedAttempts(token,attempts);
                    reject(new Error(`Code validation failed: remaining attempts: ${3-attempts}`));
                }
                
            }
        })
        .catch(err=>{reject(err)})         
    })    
}
