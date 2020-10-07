const mongoose = require('mongoose');
const User = require('mongoose').model('User');
const passport = require('passport');
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

    return newUser
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

exports.signUpUser = (req,res,next)=>{
    let form = req.body;
    console.log(form);
    
    let newUser = createNewUser(form);

    User.create(newUser)
    .then(user=>{
        if(!user){
            return res.status(500).json({
                success:false,
                result:'User not created, please try again'
            })
        }

        let jwt = issueJWT(user);

        return res.status(200).json({
            success:true,
            result:{token: jwt.token, expiresIn:jwt.expires}            
        })
    })
    .catch((err)=>next(err));   
};

exports.loginUser = (req,res,next)=>{    
    User.findOne({username:req.body.username})
    .then(user=>{        
        if(!user){            
            return res.status(401).json({success:false,result:'Este nombre de usuario no existe'})
        }
        const isValid = validPassword(req.body.password,user.hash,user.salt);
        if(isValid){
            const jwt = issueJWT(user);
            return res.status(200).json({
                success:true,
                result:{token: jwt.token, expiresIn:jwt.expires}            
            });
        }

        return res.status(401).json({success:false, result:'Por favor verifica tu clave e intenta de nuevo'})
    })
    .catch((err)=>next(err));  
};

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
    .populate('ads')
    .populate('survey')
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
