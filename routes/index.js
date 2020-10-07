module.exports = (app)=>{
    const router = require('express').Router();    
    router.get('/',(req,res)=>{
        res.send('<h1>Welcome to Atpoda</h1>')
    })

    require('./user')(router);
    require('./pet')(router);
    require('./message')(router);
    require('./ad')(router);
    require('./admin')(router);
    require('./conversation')(router);
    require('./survey')(router);

    app.use(router)
}