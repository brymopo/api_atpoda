const mongoose = require('mongoose');
const Pet = require('../models/pet');
const User = require('mongoose').model('User');

// START OF PROTECTED ROUTES' FUNCTIONS //

/* 

For the routes below, user is presumed to be logged in and in possesion of
a valid JWT containing its user id.

Upon successfully validating the user, a req.user object containing the 
user's id becomes available

*/

exports.createPet = (req,res,next)=>{    

    User.findById(req.user._id)
    .populate('pets')
    .exec()
    .then(user=>{
        let newPet = req.body;
        newPet.owner = user._id;
        Pet.create(newPet)
        .then(pet=>{
            user.pets.push(pet);
            user.save();
            req.pets = user.pets;
            next();            
        })
        .catch((err)=>next(err));  
    })
    .catch((err)=>next(err));      
}

exports.successNewPet = (req,res)=>{
    /* 
    Middleware following the createPet function, expects a req.pet object
    with the info of the newly created pet.    
    */

    if(req.pets){
        return res.status(200).json({
            success:true,
            result:req.pets
        })
    }
};

exports.updatePet=(req,res)=>{
    let id = req.params.id;
    Pet.findById(id).then(pet=>{        
        
        if(String(req.user._id)!== String(pet.owner)){
            return res.status(400).json({
                success:false,
                result:'You are not authorized to modify this pet'
            })
        }
        
        Pet.findByIdAndUpdate(id, req.body,{new:true})
        .then(updatedPet=>{
            if(updatedPet){
                return res.status(200).json({
                    success:true,
                    result:updatedPet
                })
            }
        })
        .catch((err)=>next(err));  
    })
    .catch((err)=>next(err));  
};


exports.deleteOne = (req,res)=>{
    let id = req.params.id;
    Pet.findById(id)    
    .then(foundPet=>{              
        if(String(req.user._id)!==String(foundPet.owner)){  

            return res.status(404).json({
                success: false,
                result:"You are not authorized to delete this pet"
            })
        }
        Pet.deleteOne(foundPet)
        .then(deletedPet=>{
            return res.status(200).json({
                success: true,
                result:foundPet._id
            })
        })
        .catch((err)=>next(err));  
    })
    .catch((err)=>next(err));  
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
    
    Pet.find({})
    .then(pets=>{
        return res.status(200).json({
            success:"pets found",
            result:pets
        })
    })
    .catch((err)=>next(err));  
};
