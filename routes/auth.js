const router = require('express').Router();
const Joi = require('joi');
const User = require('../models/user-model');
const bcrypt = require('bcrypt');
const utils = require('../lib/utils');
const options = require('../config/options');

router.post('/signup', (req, res) => {
    
    let signUpData = {
        username: req.body.username,
        email: req.body.email,
        password: req.body.password
    };
    const { error } = validateSignup(signUpData);
    if (error) return res.status(400).send(error.details[0].message);

    //check if user exists
    User.findOne({ email: signUpData.email })
    .then(user => {
        if (user){
            const error = new Error('email already registered');
            error.statusCode = 422;
            throw error;
        }
        
        return bcrypt.hash(signUpData.password, 10);
    })
    .then(hash => {
        const user = new User({
            username: signUpData.username,
            email: signUpData.email,
            password: hash
        })
        return user.save();
    })
    .then(result => {
        const {id, username, email} = result;
        return res.status(201).send({id: id, username: username, email: email});
    })
    .catch(err => {
        if(err.statusCode) return res.status(err.statusCode).send(err.message);
        return res.status(500).send('Something went wrong');
    });
});

router.post('/login', (req, res) => {
    const email = req.body.email;
    const password = req.body.password;
    let currUser;

    if (!email || !password) return res.status(400).send('email and password is required');

    User.findOne({ email: email})
    .then(user => {
        if(!user){
            const error = new Error('email or password is incorrect');
            error.statusCode = 401;
            throw error;
        }
        
        currUser = user;
        return bcrypt.compare(password, user.password);
    })
    .then(result => {
        if (result === true) return utils.getToken({userID: currUser._id}, options.jwtOptions);
        
        const error = new Error('email or password is incorrect');
        error.message = 401;
        throw error;
    })    
    .then(token => {
        return res.send(token);
    })
    .catch(err => {
        if(err.statusCode) return res.status(err.statusCode).send(err.message);
        return res.status(500).send('Something went wrong');
    });
});

function validateSignup(data){
    
    const schema = Joi.object().keys({
        username: Joi.string().alphanum().min(3).max(30).required(),
        email: Joi.string().email().required(),
        password: Joi.string().min(6).required()
    });

    return Joi.validate(data, schema);
};

module.exports = router;