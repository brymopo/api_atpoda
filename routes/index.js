module.exports = (app)=>{
    const router = require('express').Router();
    const Picture = require('../controllers/picture'); 
     
    router.get('/getImage',Picture.getImage);

    require('./user')(router);
    require('./pet')(router);
    require('./message')(router);
    require('./ad')(router);
    require('./admin')(router);
    require('./conversation')(router);
    require('./survey')(router);

    app.use(router)
}