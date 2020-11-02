const express = require('express');
const cors  =   require('cors');
const app   =   express();
const http =   require('http').Server(app);
const io =  require('socket.io')(http);
const passport = require('passport');
const user = require('./routes/user');


require('dotenv').config();
require('./config/database');
require('./models/user');
require('./config/passport')(passport);
require('./routes/index')


const corsOptions = {
    origin:'*',
    methods:"GET,POST,DELETE,PUT,OPTIONS",
    headers:'Authorization, X-API-KEY, Origin, X-Requested-With, Content-Type, Accept'
}

function errorHandler(error,req,res,next){
    if(error){
        console.log('Oops, I did it again, I messed up the code');
        console.log(error);
        console.log('got lost in hell, the callback hell')
        return res.status(500).json({
            success:false,
            result:error.message,
            message:'An error occurred'
        })        
    }
}

app.use(express.json());
app.use(express.urlencoded({extended: true}));
app.use(cors(corsOptions));

require('./routes/index')(app)
app.use(errorHandler);

require('./chat')(io);

const port = process.env.PORT || 3000;

app.use('*',(req,res)=>{
    return res.status(404).json({
        message:'The requested page does not exist',
        method:req.method       
    })
});

http.listen(port,()=>{
    console.log('Server running successfully');
});


module.exports = app;