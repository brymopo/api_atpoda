const mongoose = require('mongoose');
const removeFromArray = require('../auth/utils').removeFromArray;
const Pet = require('../models/pet');
const User = require('./user');


function createNew(body, userId){
    let newPet = body;
    newPet.owner = userId;
    return new Promise((resolve,reject)=>{
        Pet.create(newPet).then(pet=>{
            if(!pet){
                reject(new Error('Could not create new pet'))
            }else{
                resolve(pet)
            }
        })
        .catch(err=>{reject(err)});
    })
}

function updateDocument(body, doc){
    for (const key in body) {
        doc[key] = body[key]
    }
    return doc;
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

// START OF PROTECTED ROUTES' FUNCTIONS //

/* 

For the routes below, user is presumed to be logged in and in possesion of
a valid JWT containing its user id.

Upon successfully validating the user, a req.user object containing the 
user's id becomes available

*/

exports.createPet = async (req,res,next)=>{
    try {
        let user = req.user;        
        await user.populate('pets').execPopulate();
        let newPet = await createNew(req.body,user._id);
        user.pets.push(newPet);
        await user.save();
        return res.status(200).json({
            success:true,
            result:user.pets
        })        
    } catch (error) {
        next(error);
    }    
      
}

exports.updatePet=(req,res)=>{   
   
    Pet.findById(req.params.id).then(pet=>{        
        
        if(String(req.user._id)!== String(pet.owner)){
            return res.status(400).json({
                success:false,
                result:'You are not authorized to modify this pet'
            })
        }
        
        pet = updateDocument(req.body,pet);
        
        pet.save().then(updatedPet=>{
            if(updatedPet){
                return res.status(200).json({
                    success:true,
                    result:updatedPet
                })
            }else{
                next(new Error('Could not update pet'));
            }
        })
        .catch((err)=>next(err))        
    })
    .catch((err)=>next(err));  
};


exports.deleteOne = async (req,res)=>{
    try {
        let foundPet = await Pet.findById(req.params.id);

        if(String(req.user._id)!==String(foundPet.owner)){  
            return res.status(404).json({
                success: false,
                result:"You are not authorized to delete this pet"
            })
        };

        if(foundPet.ad){
            await deleteAd(foundPet.ad,req.user);
        }

        await Pet.deleteOne(foundPet);
        await removeFromArray(req.user,'pets',foundPet._id);

        return res.status(200).json({
            success: true,
            result:foundPet._id
        })
        
    } catch (error) {
        next(error);
    }     
};

// END OF PROTECTED ROUTES'S FUNCTIONS //

exports.showPet = (req,res)=>{
    let id = req.params.id;
    Pet.findById(id)
    .then(pet=>{
        if(pet){
            return res.status(200).json({
                success:true,
                result:pet
            })
        }
        return res.status(404).json({
            success:false,
            result:'No pet found with this Id'
        })
    })
    .catch((err)=>next(err));  
};

exports.showAll = (req,res)=>{
    
    Pet.find({}).then(pets=>{
        return res.status(200).json({
            success:"pets found",
            result:pets
        })
    })
    .catch((err)=>next(err));  
};
