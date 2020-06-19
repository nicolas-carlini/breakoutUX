const {
    Schema,
    model
} = require('mongoose');


const Score = new Schema({
    name: {
        type: String,
        default: 'Player'
    },
    score:{
        type: Number,
        defalt: 0
    }
})

module.exports = model('Score', Score);
