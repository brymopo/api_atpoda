module.exports = (router)=>{
    const passport = require('passport');
    const User = require('../controllers/user');
    
    /* ROUTES */

    router.get('/confirmation/:token',User.validateEmail);

    router.post('/users/new',User.signUpUser);
    
    router.post('/users/login',User.loginUser);

    router.post('/users/login/2fa',User.check2faCode);    

    router.post('/users/sendResetToken',User.sendResetToken);

    router.post('/users/reset_password/:token',User.resetPasswordWithToken);

    router.post('/users/login/resend2fa',User.resend2faCode);
    
    
    /* START OF PROTECTED ROUTES */
    
    router.get('/users/show',passport.authenticate('jwt',{session:false}),User.showUser);
    
    router.put('/users/update',passport.authenticate('jwt',{session:false}),User.updateUser);

    router.get('/users/password/change',passport.authenticate('jwt',{session:false}),User.requestPasswordChange);

    router.post('/users/password/change',passport.authenticate('jwt',{session:false}),User.changePassword,User.updateUser);

    
    /* END OF PROTECTED ROUTES */
};
