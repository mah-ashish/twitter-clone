const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const tweetSchema = new Schema({
    body: {
        type: String,
        required: true
    },
    user: {
        type: Schema.Types.ObjectId,
        ref: 'user',
        required: true
    },
    createdAt: { 
        type: Date,
        default: Date.now
    },
    comments: [{
        body: { type: String, default: "", maxlength: 280 },
        user: { type: Schema.Types.ObjectId, ref: 'user' },
        createdAt: { type: Date, default: Date.now }
    }]
});

const Tweet = mongoose.model('tweet', tweetSchema);

module.exports = Tweet;