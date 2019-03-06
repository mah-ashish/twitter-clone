module.exports = {
    jwtOptions: {
        issuer:  'twitter-rest',
        subject:  'login token',
        audience:  'https://node-twitter-rest.herokuapp.com',
        expiresIn:  "12h",
        algorithm:  "RS256"
    }
};