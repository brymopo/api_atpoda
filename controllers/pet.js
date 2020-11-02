const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');
const removeFromArray = require('../auth/utils').removeFromArray;
const deleteAd = require('./ad').deleteAd;
const Pet = require('../models/pet');
const User = require('./user');
const deleteImage = require('./picture').deleteImage;

function getNewImageId(req){
    let routeImage = req.files.image.path;
    let splitFile = routeImage.split('images');
    return splitFile[splitFile.length - 1].replace('/', '').replace('\\', '');
}

function createNew(req, userId){    
    let newPet = req.body;
    newPet.owner = userId;
    newPet.pictures = [];
    
    if(req.files){
        newPet.pictures.push(getNewImageId(req));
    }
    
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

function updateDocument(req, doc){
    let body = req.body;
    for (const key in body) {
        doc[key] = body[key]
    }
    if(req.files){
        doc.pictures = [getNewImageId(req)];
    }
    
    return doc;
}

function updatePicturesArray(picturesArray, req){
    if(req.files){
        picturesArray.push(getNewImageId(req));
    }
}

async function deletePicturesArray(imageArray){
    for (let index = 0; index < imageArray.length; index++) {
        try {
           let deleted = await deleteImage(imageArray[index]); 
        } catch (error) {
            console.log('an error occurred...')
            console.log(error);   
        }        
    }
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
        let newPet = await createNew(req,user._id);
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

exports.updatePet=async (req,res,next)=>{
    
    try {
        let pet = await Pet.findById(req.params.id);

        if(String(req.user._id)!== String(pet.owner)){
            return res.status(400).json({
                success:false,
                result:'You are not authorized to modify this pet'
            })
        }

        pet = updateDocument(req,pet);

        await pet.save();

        return res.status(200).json({
            success:true,
            result:pet
        })

    } catch (error) {
        next(error);
    }
};

exports.deleteOne = async (req,res,next)=>{
    try {
        let foundPet = await Pet.findById(req.params.id);

        if(String(req.user._id)!==String(foundPet.owner)){  
            return res.status(404).json({
                success: false,
                result:"You are not authorized to delete this pet"
            })
        };

        if(!!foundPet.ad){
            await deleteAd(foundPet.ad,req.user);
        }

        if(foundPet.pictures.length){
            await deletePicturesArray(foundPet.pictures);
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
