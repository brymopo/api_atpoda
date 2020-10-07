module.exports = (router)=>{    
    const passport = require('passport');
    const Pet = require('../controllers/pet');

    router.get('/pets/show',Pet.showAll);

    router.get('/pets/:id',Pet.showPet);

    /* START OF PROTECTED ROUTES */

    router.post('/pets/create',passport.authenticate('jwt',{session:false}),
    Pet.createPet,Pet.successNewPet);

    router.put('/pets/:id/update',passport.authenticate('jwt',{session:false}),
    Pet.updatePet);

    router.delete('/pets/:id/delete',passport.authenticate('jwt',{session:false}),Pet.deleteOne);

    /* END OF PROTECTED ROUTES */
}