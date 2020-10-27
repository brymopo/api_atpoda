module.exports = (router)=>{    
    const passport = require('passport');
    const Pet = require('../controllers/pet');
    const multiparty = require('connect-multiparty');
    let uploadImage = multiparty({uploadDir:'./assets/images'});  

    router.get('/pets/show',Pet.showAll);

    router.get('/pets/:id',Pet.showPet);

    /* START OF PROTECTED ROUTES */

    router.post('/pets/create',passport.authenticate('jwt',{session:false}),uploadImage,Pet.createPet);

    router.post('/pets/:id/update',passport.authenticate('jwt',{session:false}),uploadImage,Pet.updatePet);

    router.delete('/pets/:id/delete',passport.authenticate('jwt',{session:false}),Pet.deleteOne);

    /* END OF PROTECTED ROUTES */
}