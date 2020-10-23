const mongoose = require('mongoose');

require('dotenv').config();


const mongoURL = process.env.DB_URL || 'mongodb://localhost:27017/atpoda';


mongoose.connect(mongoURL, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useFindAndModify:false
});

mongoose.connection.on('connected', () => {
    console.log('Database connected');
});