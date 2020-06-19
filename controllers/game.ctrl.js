//express router
const {
    Router
} = require('express');
const router = Router();

//mongodb
const Score = require('../models/Score.model')

router.get('/', async (req, res) => {
    res.render('index');
})

module.exports = router;