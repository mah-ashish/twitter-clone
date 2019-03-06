const router = require('express').Router();
const User = require('../models/user-model');
const Chat = require('../models/chat-model');

//get messages from a conversation 
router.get('/:userid', (req, res) => {
    const userid = req.params.userid;

    Chat.find({ $or: [
            { $and: [{ sender: userid }, { receiver: req.userID }] },
            { $and: [{ sender: req.userID }, { receiver: userid }] }
        ]
    })
    .populate('sender','_id username email')
    .populate('receiver','_id username email')
    .sort({ createdAt: -1 })
    .then(chats => {
        return res.send(chats);
    })
    .catch(err => {
        if(err.statusCode) return res.status(err.statusCode).send(err.message);
        return res.status(500).send('Something went wrong');
    });
});

//send a message to a user
router.post('/:userid', (req, res) => {
    const userid = req.params.userid;
    const body = req.body.content;

    if(!body) return res.status(400).send('content is required');

    User.findById(userid)
    .then(user => {
        if (!user){
            const error = new Error('No such user');
            error.statusCode = 404;
            throw error;
        }
        if (user._id.toString() === req.userID){
            const error = new Error('Can not message to self');
            error.statusCode = 422;
            throw error;
        }
        const chat = new Chat({
            sender: req.userID,
            receiver: user._id,
            body: body
        });
        return chat.save();
    })
    .then(chat => {
        return res.send(chat);
    })
    .catch(err => {
        if(err.statusCode) return res.status(err.statusCode).send(err.message);
        return res.status(500).send('Something went wrong');
    })
});

module.exports = router;