const jwt = require('jsonwebtoken');
const fs = require('fs');

const getToken = function (payload, signOptions){
    return new Promise((resolve, reject) => {

        fs.readFile(__dirname + '/../config/private.key', 'utf8', (err, privateKey) =>{
            if (err) return reject('Private Key not found');
            
            let token = jwt.sign(payload, privateKey, signOptions);
            return resolve(token);
        });
                        
    });
}

const verifyToken = function (token, verifyOptions){
    return new Promise((resolve, reject) => {

        fs.readFile(__dirname + '/../config/public.key', (err, publicKey) => {
            if (err) return reject('Public Key not found');

            jwt.verify(token, publicKey, verifyOptions, (err, decoded) => {
                if (err) return reject(false);

                return resolve(decoded);
            });
        });
    });
}

module.exports.getToken = getToken;
module.exports.verifyToken = verifyToken;