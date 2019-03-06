const router = require('express').Router();
const Tweet = require('../models/tweet-model');
const User = require('../models/user-model');

//get all tweets
router.get('/', (req, res) => {
    Tweet.find({})
    .then(tweets => {
        return res.send(tweets);
    })
    .catch(err => {
        return res.status(500).send('Something went wrong');
    });
});

//get all tweets from users which a user follows
router.get('/followingtweets', (req, res) =>{
    User.findById(req.userID)
    .populate('following', '_id')
    .select('following')
    .then(user => {
        Tweet.find({ "user": { $in: user.following } })
        .populate('user', '_id username email')
        .then(tweets => {
            return res.send(tweets);
        })
    })
    .catch(err => {
        res.status(500).send('Something went wrong');
    });
});

//post a tweet
router.post('/', (req, res) => {
    if (!req.body.content)
        return res.status(400).send('content is required');

    new Tweet({
        body: req.body.content,
        user: req.userID
    }).save()
    .then(result =>{
        return res.send(result);
    })
    .catch(err =>{
        return res.status(500).send('Something went wrong');
    })
});

//get tweet by id
router.get('/:id', (req, res) => {
    const id = req.params.id;
    
    Tweet.findById(id)
    .then(tweet => {
        if(!tweet) {
            const error = new Error('No such tweet');
            error.statusCode = 404;
            throw error;
        }
        return res.send(tweet);
    })
    .catch(err => {
        if (err.statusCode) return res.status(err.statusCode).send(err.message);
        return res.status(500).send('Something went wrong');
    });
});

//update tweet
router.put('/:id', (req, res) => {
    let id = req.params.id;
    let content = req.body.content;

    if(!content)
        return res.status(400).send('content is required');

    Tweet.findById(id)
    .then(tweet => {
        if(!tweet){
            const error = new Error('No such tweet');
            error.statusCode = 404;
            throw error;
        } 
        
        if(tweet.user.toString() !== req.userID){
            const error = new Error('Unauthorized');
            error.statusCode = 403;
            throw error;
        } 

        return Tweet.findByIdAndUpdate(id, { body: content}, { new: true, useFindAndModify: false });
    })
    .then(tweet => {
        return res.send(tweet);
    })
    .catch(err => {
        if(err.statusCode) return res.status(err.statusCode).send(err.message);
        return res.status(500).send(err.message);
    });
});

//delete tweet
router.delete('/:id', (req, res) => {
    let id = req.params.id;

    Tweet.findById(id)
    .then(tweet => {
        if(!tweet){
            const error = new Error('No such tweet');
            error.statusCode = 404;
            throw error;
        }

        if(tweet.user.toString() !== req.userID){
            const error = new Error('Unauthorized request');
            error.statusCode = 403;
            throw error;
        }

        return Tweet.findOneAndDelete({_id: id})
    })
    .then(result => {
        return res.send(result);
    })
    .catch(err => {
        if (err.statusCode) return res.status(err.statusCode).send(err.message);
        return res.status(500).send(err.message);
    });
});

//post a comment
router.post('/:tweetid/comments', (req, res) => {
    const tweetid = req.params.tweetid;
    const body = req.body.content;

    Tweet.findById(tweetid)
    .then(tweet => {
        if (!tweet){
            const error = new Error('No such tweet');
            error.statusCode = 404;
            throw error;
        }

        tweet.comments.push({body: body, user: req.userID});
        return tweet.save();
    })
    .then(tweet => {
        return res.send(tweet);
    })
    .catch(err => {
        if (err.statusCode) return res.status(err.statusCode).send(err.message);
        return res.status(500).send('Something went wrong');
    })

});

//edit a comment
router.put('/:tweetid/comments', (req, res) => {
    const tweetid = req.params.tweetid;
    const commentid = req.body.commentid
    const body = req.body.content;

    if(!commentid || !body) return res.status(400).send('commentid and content is required');

    Tweet.findById(tweetid)
    .then(tweet => {
        if(!tweet){
            const error = new Error('No such tweet');
            error.statusCode = 404;
            throw error;
        }

        const comment = tweet.comments.find(comment => comment._id.toString() === commentid);
        if (!comment){
            const error = new Error('No such comment');
            error.statusCode = 404;
            throw error;
        }
        if (comment.user.toString() !== req.userID){
            const error = new Error('Unauthorized');
            error.statusCode = 404;
            throw error;
        }

        comment.body = body;
        return tweet.save();
    })
    .then(tweet => {
        return res.send(tweet);
    })
    .catch(err => {
        if (err.statusCode) return res.status(err.statusCode).send(err.message);
        return res.status(500).send('Something went wrong');
    });
});

//delete a comment
router.delete('/:tweetid/comments', (req, res) => {
    const tweetid = req.params.tweetid;
    const commentid = req.body.commentid;

    Tweet.findById(tweetid)
    .then(tweet => {
        if(!tweet){
            const error = new Error('No such tweet');
            error.statusCode = 404;
            throw error;
        }

        const comment = tweet.comments.find(comment => comment._id.toString() === commentid);
        if (!comment){
            const error = new Error('No such comment');
            error.statusCode = 404;
            throw error;
        }
        if (comment.user.toString() !== req.userID){
            const error = new Error('Unauthorized');
            error.statusCode = 403;
            throw error;
        }

        const index = tweet.comments.indexOf(comment);
        tweet.comments.splice(index, 1);
        return tweet.save();
    })
    .then(tweet => {
        return res.send(tweet);
    })
    .catch(err => {
        if (err.statusCode) return res.status(err.statusCode).send(err.message);
        return res.status(500).send('Something went wrong');
    });
});

module.exports = router;