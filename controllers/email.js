const nodemailer = require('nodemailer');
const Validator = require('validator');

function findInputError(recepient,subject,data){
    if(!recepient || !subject || !data){
        throw new Error('Missing one or more arguments');
    };
    if(!data.hasOwnProperty('text') || !data.hasOwnProperty('html')){
        throw new Error('either text and/or HTML is missing');
    };
    if(!Validator.isEmail(recepient)){
        throw new Error('Recepient is not an email');
    }
    if(!data.text.length || !data.html.length){
        throw new Error('text and/or HTML cannot be empty');
    }
    if(typeof data.text !== 'string' || typeof data.html !== 'string'){
        throw new Error('text and html can only be strings');
    }
    return false;
    
}

function setupTransport (){
    let transport = nodemailer.createTransport({
            host:'smtp.gmail.com',
            port:587,
            secure:false,
            auth:{
                user:process.env.EMAIL_USER,
                pass:process.env.EMAIL_PASS
            }
        })
    return transport;
}

function setupMessage(recepient,subject,data){
    let inputError = findInputError(recepient,subject,data);

    if(inputError){
        throw inputError
    }   

    return {
        from:"'Atpoda Web' <atpodaweb@gmail.com>",
        to:recepient,
        subject:subject,
        text:data.text,
        html:data.html
    }
}

function sendToken(recepientEmail,subject,content){
    return new Promise((resolve,reject)=>{
        let transporter = setupTransport();
        let message = setupMessage(recepientEmail,subject,content);
        transporter.sendMail(message).then(()=>{
            resolve(true);
        })
        .catch(e=>{reject(e)})
    })
    
};

module.exports = {setupMessage,setupTransport,findInputError,sendToken};

