module.exports = (app)=>{
    const router = require('express').Router();
    const Picture = require('../controllers/picture'); 
     
    router.get('/getImage',Picture.getImage);

    require('./user')(router);
    require('./pet')(router);    
    require('./ad')(router);
    require('./admin')(router);    
    require('./survey')(router);

    app.use(router)
}