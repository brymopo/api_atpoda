// CONTROLLERS
const User = require('mongoose').model('User');
const Token = require('./token');
const Email = require('./email');
const Template = require('../email_templates/templates');
const TwoFA = require('./2fa');

//UTIL FUNCTIONS
const issueJWT  =   require('../auth/utils').issueJWT;
const validPassword = require('../auth/utils').validPassword;
const genPassword = require('../auth/utils').genPassword;

function createNewUser(form){
    let hashAndSalt = genPassword(form.password);
    
    let newUser ={
        username:form.username,
        firstName:form.firstName,
        lastName:form.lastName,
        email:form.email,        
        phone:form.phone,
        hash:hashAndSalt.hash,
        salt:hashAndSalt.salt
    };

    return new Promise((resolve,reject)=>{
        User.create(newUser).then(user=>{
            if(!user){
                reject(new Error('Could not create user, please try again'));
            }else{
                resolve(user);
            }
        })
        .catch(e=>{reject(e)})
    });    
};


function filterOutHashAndSalt(user){
    /* 
    Loops through the keys of property _doc of the User document and returns a copy
    object without the password's hash and salt
    */

    const filtered = {};

    for (const key in user._doc) {
        if(!(key==='hash'||key==='salt')){
            filtered[key] = user[key]
        }
    }
    
    return filtered;
}

function findUser(query){
    
    return new Promise((resolve,reject)=>{
        User.findOne(query).then(foundUser=>{
            if(!foundUser){
                reject(new Error('Could not locate user. Retry')); 
            }
        
            resolve(foundUser);
        })
        .catch(e=>{reject(e)});
    })
}

exports.signUpUser = async (req,res,next)=>{
    try {
        let newUser = await createNewUser(req.body);
        let emailToken = await Token.create(newUser._id);

        let content = {
            text:'Hello',
            html:Template.firstValidation(newUser,emailToken)
        };

        let isSuccessSent = await Email.sendToken(newUser.email,'Activa tu cuenta',content);
        
        return res.status(200).json({
                success:isSuccessSent,
                result:'email sent'
        });        
    } catch (error) {
        next(error)
    }        
};

exports.sendResetToken = async (req,res,next)=>{
    try {
        let user = await findUser({email:req.body.email});
        let emailToken = await Token.create(user._id);       

        let content = {
            text:'Hello',
            html:Template.resetPassword(user,emailToken)
        };

        let isSuccessSent = await Email.sendToken(user.email,'Reestablecer Clave',content);
        
        return res.status(200).json({
                success:isSuccessSent,
                result:'email sent'
        });

      
    } catch (error) {
        next(error);
    }         
};

exports.resetPasswordWithToken = async (req,res,next)=>{
    try {
        
        let token = await Token.retrieve(req.params.token);
        let user = await findUser({_id:token._userId});
        let hashAndSalt = genPassword(req.body.newPassword);
        
        user.hash = hashAndSalt.hash;
        user.salt = hashAndSalt.salt;
        let isSuccess = await user.save();
        
        if(isSuccess){  

            Token.destroy(token).then(()=>{               

                return res.status(200).json({
                    success:true,
                    result:'password reset'
                })
            })
            .catch(e=>{next(e)});
            
        };        
    } catch (error) {
        next(error)
    }
}

exports.validateEmail = async (req,res,next)=>{
    try {
        let token = await Token.retrieve(req.params.token);
        let user = await findUser({_id:token._userId});
        user.isVerified = true;
        
        let isSuccess = await user.save();
        
        if(isSuccess){            
            let jwt = issueJWT(user);
            Token.destroy(token);    
            return res.status(200).json({
                success:true,
                result:{token: jwt.token, expiresIn:jwt.expires}            
            }) ;               
        }
    } catch (error) {
        next(error)
    }
    
}

exports.loginUser = async (req,res,next)=>{
    try {
        let foundUser = await findUser({username:req.body.username});
    
        if(!foundUser.isVerified){
            return res.status(401).json({success:false,result:'El usuario aun no ha verificado su direccion de correo electronico'})
        };
            
        const isValid = validPassword(req.body.password,foundUser.hash,foundUser.salt);
        
        if(isValid){
            let code2fa = await TwoFA.createCode(foundUser);
            return res.status(200).json({
                success:true,
                result:code2fa
            })        
        }else{
            return res.status(401).json({success:false, result:'Por favor verifica tu clave e intenta de nuevo'});
        }

    } catch (error) {
        next(error);
    }  
    
};

exports.check2faCode = async (req,res,next)=>{
    try {

        let isValidCode = await TwoFA.verifyCode(req.body);
    
        if(isValidCode){
            const jwt = issueJWT({_id:req.body.userId});

            return res.status(200).json({
                    success:true,
                    result:{token: jwt.token, expiresIn:jwt.expires}  
            })
        }
        
    } catch (error) {

        next(error);
        
    }  
    
}

// START OF PROTECTED ROUTES' FUNCTIONS //

/* 

For the routes below, user is presumed to be logged in and in possesion of
a valid JWT containing its user id.

Upon successfully validating the user, a req.user object containing the 
user's id becomes available

*/

exports.showUser = (req,res,next)=>{    
    
    if(!req.user){
        return res.status(204).json({
            success:false,
            result:'User could not be found'
        })
    }
    
    User.findById(req.user._id)
    .populate('pets')
    .populate({
        path:'ads',
        populate:{
            path: 'pet',
            model:'Pet'
        }
    })
    .populate('survey')
    .populate('reportedAds')
    .exec()
    .then(user=>{
        if(user){

            const filteredUser = filterOutHashAndSalt(user);

            return res.status(200).json({
                success:true,
                result:filteredUser
            })
        }
        let error = new Error('User could not be found');
        next(error);
    })
    .catch(e=>next(e));
};

exports.updateUser = (req,res)=>{
    if(req.user){
        User.findByIdAndUpdate(req.user._id,req.body,{new:true})
        .populate('pets')
        .populate('ads')
        .populate('survey')
        .exec()
        .then(updatedUser=>{
            if(updatedUser){
                const filteredUser = filterOutHashAndSalt(updatedUser);
                return res.status(200).json({
                    success:true,
                    result:filteredUser
                })
            }
        })
        .catch((err)=>next(err));  
    }
};

// END OF PROTECTED ROUTES' FUNCTIONS //
