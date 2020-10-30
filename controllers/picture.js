const fs = require('fs');
const path = require('path');
const { exists } = require('../models/ad');

exports.getImage = (req,res,next)=>{
    const imageId = req.query.image;
    const imagePath = `./assets/images/${imageId}`;

    console.log('one request received...')

    fs.exists(imagePath,(exists)=>{
        if(exists){
            res.sendFile(path.resolve(imagePath));
        }else{
            next(new Error('Requested image does not exists'));
        }
    })

}

exports.deleteImage = (id)=>{
    const imagePath = `./assets/images/${id}`;
    return new Promise((resolve,reject)=>{
        fs.exists(imagePath,(exists)=>{
            if(exists){
                fs.unlink(imagePath, (error)=>{
                    if(error){
                        reject(error);
                    }else{
                        resolve(true);
                    }
                })
            }
        })
        
    })
};
