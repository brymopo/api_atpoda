const mongoose = require('mongoose');
const Admin = require('../models/admin');
const Ad = require('../models/ad');
const SurveyQuestion = require('../models/survey_question');
const genPassword = require('../auth/utils').genPassword;
const deleteAd = require('./ad.js').deleteAd;

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

exports.isAdmin = (req,res,next)=>{    
    if(!req.user.admin){
        return res.status(400).json({
            success:false,
            result:'You are not an admin'
        })
    };
    next();
}

exports.reportAd = (req,res,next)=>{
    const reportedId = req.body.id;
    Admin.findOne({admin:true})
    .then(admin=>{
       
        if(!admin.reportedAds.includes(reportedId)){
            admin.reportedAds.push(reportedId);
        }
        
        admin.save();

        return res.status(200).json({
            success: true            
        })
    })
    .catch(e=>next(e))
}

exports.delete = (req,res,next)=>{
    Admin.findByIdAndRemove({_id:req.params.id})
    .then(deleted=>{
        if(deleted){
            res.status(200).send("OK")
        }
    })
}

exports.removeFromReportedArray= (req,res,next)=>{
    
    Admin.findById(req.user._id)
    .then(admin=>{
        let reportedAds = admin.reportedAds;
        
        let result = reportedAds.filter(ad=> !(ad == req.params.adId));
        
        admin.reportedAds = result;
        admin.save();
        Admin.populate(admin,{path:'reportedAds'})
        .then(popAdmin=>{
            return res.status(200).json({
                success:true,
                result:popAdmin.reportedAds
            })
        })
        .catch(e=>next(e))
        
    })
    .catch(e=>next(e))
}

