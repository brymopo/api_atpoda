const crypto = require('crypto');
const jsonwebtoken = require('jsonwebtoken');
const fs = require('fs');
const path = require('path');
const passport = require('passport');

const pathToKey = path.join(__dirname, '..', 'keys/rsa_priv_key.pem');
const PRIV_KEY = fs.readFileSync(pathToKey, 'utf8');



function validPassword(password, hash, salt) {
    let hashVerify = crypto.pbkdf2Sync(password, salt, 10000, 64, 'sha512').toString('hex');
    return hash === hashVerify;
}

function genPassword(password) {
    let salt = crypto.randomBytes(32).toString('hex');
    let genHash = crypto.pbkdf2Sync(password, salt, 10000, 64, 'sha512').toString('hex');
    
    return {
      salt: salt,
      hash: genHash
    };
}

function issueJWT(user) {
    const _id = user._id;
  
    const expiresIn = '7d';
  
    const payload = {
      sub: _id,
      iat: Date.now()
    };
  
    const signedToken = jsonwebtoken.sign(payload, PRIV_KEY, { expiresIn: expiresIn, algorithm: 'RS256' });
  
    return {
      token: "Bearer " + signedToken,
      expires: expiresIn
    }
  };
  
  function authUser(req,res,next){
    /* 
    Middleware that verifies the current user id matches the author's user id.
    Expects a compareId property in the req object that is setup by a
    previous middleware to match the author's user id
    */
    
    if(!(String(req.user._id)===String(req.compareId))){
        return res.status(400).json({
            success:false,
            result:'You are not authorized to modify this item'
        })
    }else{
        next();
    }
};

function removeFromArray(doc,key,idToRemove){
    
  return new Promise((resolve, reject)=>{
    let targetArray = doc[key];
    targetArray = targetArray.filter(elem=>String(elem) !== String(idToRemove));
    doc[key] = targetArray;
    doc.save().then(saved=>{
      if(saved){
        resolve(true)
      }else{
        reject(new Error('Remove from array failed. Document not saved'))
      }
    })
    .catch(err=>{reject(err)})
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

  module.exports.validPassword = validPassword;
  module.exports.genPassword = genPassword;
  module.exports.issueJWT = issueJWT;
  module.exports.authUser = authUser;
  module.exports.removeFromArray = removeFromArray;
  module.exports.deleteAd = deleteAd;

  

