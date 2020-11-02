const mongoose = require('mongoose');
const Ad =  require('../models/ad');
const removeFromArray = require('../auth/utils').removeFromArray;
const updateRemoveOneFromDoc = require('../auth/utils').updateRemoveOneFromDoc;

function pushToPet(petId,adId){
    return new Promise(async (resolve,reject)=>{
        try {
            const Pet = require('../models/pet');
            let pet = await Pet.findById(petId);
            console.log('pet: ',pet);
            console.log('typeof ad',typeof pet.ad)

            if(pet.ad){
                reject(new Error('An ad already exists for this pet'))
            }else{
                pet.ad = adId;
                let result = await pet.save();
                result? resolve(true):reject(false)
            }           
            
        } catch (error) {
            reject(error)
        }       
        
    })
}

function deleteAd(id,user){
    
    return new Promise(async (resolve,reject)=>{
        try {
            const Ad = require('../models/ad');
            await Ad.findByIdAndRemove(id);
            await removeFromArray(user,'ads',id);            
            resolve(true);
        } catch (error) {
            reject(error);
        }       
        
    })
}

exports.deleteAd = deleteAd;

exports.deleteReportedAd = async (req,res,next)=>{
    const User = require('mongoose').model('User');
    const Pet = require("../models/pet");
    try {
        let reportedAd = await Ad.findById(req.params.adId);
        await reportedAd.populate('pet').execPopulate();

        let pet = await Pet.findById(reportedAd.pet._id);
        let user = await User.findById(pet.owner);
        console.log('pet owner: ',pet.owner);
        console.log('found user: ',user);
        pet.ad = undefined;
        await pet.save();        
        let deleteSuccess = await deleteAd(reportedAd._id,user);
        
        if(deleteSuccess){
            next();
        }
              
    } catch (error) {
        next(error);
    }
}

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
            return res.status(404).json({
                success: false,
                result:"No add found with this id"
            })
        }
    })
    .catch((err)=>next(err));  
}; 

exports.showAds = (req,res,next)=>{
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

exports.createAdd = async (req,res,next)=>{
    let user = req.user;
    const newAd = new Ad({pet:req.body}); 
    try {        

        if(user.ads.length >= 2){
            throw Error('No more than two adds allowed')
        }
        
        await newAd.save();
        
        let result = await pushToPet(newAd.pet,newAd._id);        
        if(result){
            user.ads.push(newAd._id);
            await user.save();
            await newAd.populate('pet').execPopulate();
            return res.status(200).json({
                success:true,
                result:newAd
            })
        }
    } catch (error) {
        if(newAd._id){
            Ad.findByIdAndRemove(newAd._id).then(()=>{
                next(error)
            })
            .catch(e=>next(error));  
        }else{
            next(error);
        }
               
    }
    
};

exports.deleteOne = (req,res,next)=>{
    Ad.findById(req.params.id)
    .populate('pet')
    .exec()
    .then(foundAd=>{       

        if(String(req.user._id)!==String(foundAd.pet.owner)){     

            return res.status(404).json({
                success: false,
                result:"You are not authorized to delete this add"
            })
        }

        Ad.deleteOne(foundAd).then((deletedAd)=>{
            removeFromArray(req.user,'ads',foundAd._id).then(result=>{
                if(result){
                    return res.status(200).json({
                        success: true,
                        result:foundAd._id
                    })
                }
            })
            .catch((err)=>next(err));              
                       
        })
        .catch((err)=>next(err));  
        
    })
    .catch((err)=>next(err));  
}

// END OF PROTECTED ROUTES' FUNCTIONS //
