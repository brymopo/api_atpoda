const Nexmo = require('nexmo');

const nexmo = new Nexmo({
    apiKey:process.env.API_KEY,
    apiSecret:process.env.API_SECRET
});

exports.createCode = (user)=>{
    
    let targetNumber = `57${user.phone}`;
    
    return new Promise((resolve,reject)=>{
        nexmo.verify.request({
            number:targetNumber,
            brand:'ATPODA',
            code_length:'6'
        },(err,result)=>{
            if(result.status != 0){
                reject(new Error(result.error_text));
            }else{
                resolve({
                    requestId:result.request_id,
                    userId:user._id 
                });                
            }
        })
    })    
};

exports.verifyCode = (body)=>{
    return new Promise((resolve,reject)=>{
        nexmo.verify.check({
            request_id:body.requestId,
            code:body.code
        }, (err,result)=>{
            if(result.status != 0){
                reject(result.error_text);
            }else{
                resolve(true);
            }
        })
    })    
}
