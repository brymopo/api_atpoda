module.exports = (router)=>{
    const passport = require('passport');
    const User = require('../controllers/user');
    
    /* ROUTES */
    router.post('/users/new',User.signUpUser);
    
    router.post('/users/login',User.loginUser);
    
    /* START OF PROTECTED ROUTES */
    
    router.get('/users/show',passport.authenticate('jwt',{session:false}),User.showUser);
    
    router.put('/users/update',passport.authenticate('jwt',{session:false}),User.updateUser);
    
    /* END OF PROTECTED ROUTES */
};
