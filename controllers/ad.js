const mongoose = require('mongoose');
const ad = require('../models/ad');
const Ad =  require('../models/ad');
const User = require('mongoose').model('User');
const Pet = require('../models/pet');

exports.showOne = (req,res,next)=>{
    let id = req.params.id;
    Ad.findById(id)
    .populate('pet')
    .populate('conversations')
    .exec()
    .then(foundAd =>{
        if(foundAd){
            return res.status(200).json({
                success: true,
                result:foundAd
            })
        }else{
            return res.status(200).json({
                success: false,
                result:"No add found with this id"
            })
        }
    })
    .catch((err)=>next(err));  
};

exports.showAds = (req,res)=>{
    Ad.find()
    .populate('pet')
    .populate('conversations')
    .exec()
    .then(ads=>{
        if(ads){
            return res.status(200).json({
                success:true,
                result:ads
            })
        }
        return res.status(200).json({
            success:false,
            result:'No ads to show at this time'
        })    
    })
    .catch((err)=>next(err));  
}

// START OF PROTECTED ROUTES' FUNCTIONS //

/* 

For the routes below, user is presumed to be logged in and in possesion of
a valid JWT containing its user id.

Upon successfully validating the user, a req.user object containing the 
user's id becomes available

*/

exports.createAdd = (req,res,next)=>{
    
    User.findById(req.user._id)
    .then(user=>{
        const newAd = new Ad({pet:req.body});        
        newAd.save()                  
        .then(newAd=>{
            user.ads.push(newAd._id);
            user.save();
            Ad.populate(newAd, {path:'pet'})
            .then(popAd=>{
                return res.status(200).json({
                    success:true,
                    result:popAd
                })
            })
            .catch(e=>next(e))
            
        })
    })
    .catch((err)=>next(err));  
};

exports.deleteOne = (req,res,next)=>{
    let id = req.params.id;
    Ad.findById(id)
    .populate('pet')
    .exec()
    .then(foundAd=>{       

        if(String(req.user._id)!==String(foundAd.pet.owner)){     

            return res.status(404).json({
                success: false,
                result:"You are not authorized to delete this add"
            })
        }

        Ad.deleteOne(foundAd)
        .then((deletedAd)=>{
            
            if(deletedAd){
                return res.status(200).json({
                    success: true,
                    result:foundAd._id
                })
            }
                       
        })
        
    })
    .catch((err)=>next(err));  
}

// END OF PROTECTED ROUTES' FUNCTIONS //
