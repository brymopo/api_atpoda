const fs = require('fs');
const passport = require('passport');
const path = require('path');
const User = require('mongoose').model('User');
const JwtStrategy = require('passport-jwt').Strategy;
const ExtractJwt = require('passport-jwt').ExtractJwt;

const pathToKey = path.join(__dirname, '..', 'keys/rsa_pub_key.pem');
const PUB_KEY = fs.readFileSync(pathToKey, 'utf8');


const options = {
    jwtFromRequest : ExtractJwt.fromAuthHeaderAsBearerToken(),
    secretOrKey:PUB_KEY,
    algorithms:['RS256']
};

const strategy = new JwtStrategy(options, (payload, done)=>{
   User.findOne({_id:payload.sub})
    .then((user)=>{
        if(user){
            return done(null,user);
        }else{
            return done(null,false);
        }
    }).catch((err)=>{
        return done(err,false);
    })
})

module.exports = (passport) => {
    passport.use(strategy);
}