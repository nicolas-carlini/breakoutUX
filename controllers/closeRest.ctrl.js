const config = require('../config');

module.exports = (req, res, next) => {
    try {
        const host = req.headers.host;
        const parsedns = host.slice(req.url.indexOf('/'));
        console.log('hosted in', parsedns)
        if (parsedns == process.env.DNS || config.dns) next();
        else res.json({
            error: true,
            message: "dns not valid"
        })
    } catch (error) {
        res.json({
            error: true,
            message: "not catched error"
        })
    }
};
