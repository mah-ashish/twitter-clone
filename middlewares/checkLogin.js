const utils = require('../lib/utils');
const options = require('../config/options')

//check validity of token
const checkLogin = function (req, res, next){
    
    if (!req.get('bearer'))   return res.status(401).send('No token provided');
    const bearer = req.get('bearer');
    
    utils.verifyToken(bearer, options.jwtOptions)
    .then(user => {
        req.userID = user.userID;
        req.user = user;
        next();
    })
    .catch(err => {
        res.status(401).send('Invalid Token');
    });
};

module.exports = checkLogin;