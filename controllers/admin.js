const mongoose = require('mongoose');
const Admin = require('../models/admin');
const SurveyQuestion = require('../models/survey_question');
const genPassword = require('../auth/utils').genPassword;

function createAdmin(form){
    let hashAndSalt = genPassword(form.password);

    let newAdmin = new Admin({
        username:form.username,
        firstName:form.firstName,
        lastName:form.lastName,
        email:form.email,        
        phone:form.phone,
        hash:hashAndSalt.hash,
        salt:hashAndSalt.salt,
        admin:true
    })

    return newAdmin
}

exports.create = (req,res)=>{
    let form = req.body;

    let newAdmin = createAdmin(form);    

    newAdmin.save()
    .then(admin=>{
        if(!admin){
            return res.status(206).send("<h1>Admin could not be created</h1>")
        }
        return res.status(200).json({
            message:"Admin created",
            result:admin
        })
    })
    .catch((err)=>next(err));  
}

exports.isAdmin = (req,res,next)=>{    
    if(!req.user.admin){
        return res.status(400).json({
            success:false,
            result:'You are not an admin'
        })
    };
    next();
}


