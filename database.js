const mongoose = require('mongoose');
const {
    DB
} = require('./config');

//const uri = 'mongodb+srv://BDUserVivenciaBokita:PRJnSd2VZloDg8qM@testelerningboca-pnmyg.mongodb.net/test?retryWrites=true&w=majority';

mongoose.connect(DB, {
        useNewUrlParser: true,
        useUnifiedTopology: true
    })
    .then(db => {
        console.log('DataBase is connected')
    })