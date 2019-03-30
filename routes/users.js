const router = require('express').Router();
const User = require('../models/user-model');

//get all users
router.get('/', (req, res) => {
    User.find({})
    .select('_id username email following followers')
    .populate('followers','_id username email')
    .populate('following','_id username email')
    .then(users => {
        return res.send(users);
    })
    .catch(err => {
        if(err.statusCode) return res.status(err.statusCode).send(err.message);
        return res.status(500).send('Something went wrong');
    });
});

//get all followers
router.get('/followers/:id', (req, res) => {
    User.getFollowers(req.params.id)
    .then(followers => {
        res.send(followers);
    })
    .catch(err => {
        if(err.statusCode) return res.status(err.statusCode).send(err.message);
        return res.status(500).send('Something went wrong');
    });
});

//get all followees
router.get('/following/:id', (req, res) => {
    User.getFollowing(req.params.id)
    .then(following => {
        res.send(following);
    })
    .catch(err => {
        if(err.statusCode) return res.status(err.statusCode).send(err.message);
        return res.status(500).send('Something went wrong');
    });
});

//follow a user. If following already, no action
router.post('/follow', (req, res) =>{
    const id = req.body.id;
    
    if(!id) return res.status(400).send('id is required');

    if(id === req.userID) return res.status(422).send('Cannot follow/unfollow self');
    
    User.addFollow(req.userID, id)
    .then(result => {
        return res.send(result);
    })
    .catch(err => {
        if(err.statusCode) return res.status(err.statusCode).send(err.message);
        return res.status(500).send('Something went wrong');
    });
});

//unfollow a user. If not following, no action
router.post('/unfollow', (req, res) =>{
    const id = req.body.id;
    
    if(!id) return res.status(400).send('id is required');

    if(id === req.userID) return res.status(422).send('Cannot follow/unfollow self');

    User.removeFollow(req.userID, id)
    .then(result => {
        return res.send(result);
    })
    .catch(err => {
        if(err.statusCode) return res.status(err.statusCode).send(err.message);
        return res.status(500).send('Something went wrong');
    });
});

//get information of a user
router.get('/profile/:id', (req, res) => {
    const id = req.params.id;

    User.getProfile(id)
    .then(user =>{
        return res.send(user);
    })
    .catch(err =>{
        if(err.statusCode) return res.status(err.statusCode).send(err.message);
        return res.status(500).send('Something went wrong');
    })
});

//get all tweets of a user
router.get('/tweets/:id', (req, res) =>{
    const id = req.params.id;

    User.getTweets(id)
    .then(tweets =>{
        return res.send(tweets);
    })
    .catch(err => {
        if(err.statusCode) return res.status(err.statusCode).send(err.message);
        return res.status(500).send('Something went wrong');
    })
});

module.exports = router;