module.exports = (router)=>{

    const passport = require('passport');
    const Ad    =   require('../controllers/ad');
    const Pet   =   require('../controllers/pet');

    router.post('/ads/create',passport.authenticate('jwt',{session:false}),
    Pet.createPet,Ad.createAdd);

    router.get('/ads/show_all',Ad.showAds);

    router.get('/ads/:id',Ad.showOne);

    router.delete('/ads/:id/delete',passport.authenticate('jwt',{session:false}),Ad.deleteOne);

}


