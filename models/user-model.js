const mongoose = require('mongoose');
const Tweet = require('./tweet-model');
const Schema = mongoose.Schema;

const userSchema = new Schema({
    username: {
        type: String,
        required: true
    },
    email:{
        type: String,
        required: true
    },
    password:{
        type: String,
        required: true
    },
    followers: [{ type: Schema.Types.ObjectId, ref: 'user' }],
    following: [{ type: Schema.Types.ObjectId, ref: 'user' }]
});


//static methods
userSchema.statics = {
    getProfile: function(id){
        return new Promise((resolve, reject) => {
            this.findById(id)
            .populate("followers", "_id username email")
            .populate("following", "_id username email")
            .select('username email followers following')
            .then(user => {
                if (!user){
                    const error = new Error('No such user');
                    error.statusCode = 404;
                    throw error;
                }
                return resolve(user);
            })
            .catch(err =>{
                return reject(err);
            });
        });
    },
    addFollow: function(followerid, followingid){
        let follower;
        return new Promise((resolve, reject) => {
            this.findById(followerid)
            .then(user => {
                if (!user){
                    const error = new Error('No such follower');
                    error.statusCode = 404;
                    throw error;
                }
                follower = user;
                return this.findById(followingid);
            })
            .then(following => {
                if (!following){
                    const error = new Error('No such followee');
                    error.statusCode = 404;
                    throw error;
                }
                
                follower.following.addToSet(following);
                following.followers.addToSet(follower);

                follower.save();
                following.save();

                return resolve('followed');
            })
            .catch(err => {
                console.log(err.message);
                return reject(err);
            })
        });
    },
    removeFollow: function(followerid, followingid){
        let follower;
        return new Promise((resolve, reject) => {
            this.findById(followerid)
            .then(user => {
                if (!user){
                    const error = new Error('No such follower');
                    error.statusCode = 404;
                    throw error;
                }
                follower = user;
                return this.findById(followingid);
            })
            .then(following => {
                if (!following){
                    const error = new Error('No such followee');
                    error.statusCode = 404;
                    throw error;
                }

                follower.following.pull(following);
                following.followers.pull(follower);

                follower.save();
                following.save();

                return resolve('unfollowed');
    
            })
            .catch(err => {
                return reject(err);
            });
        });
    },
    getFollowers: function(id){
        return new Promise((resolve, reject) =>{
            this.findById(id).populate("followers", "_id username email")
            .then(user => {
                return resolve(user.followers);
            })
            .catch(err =>{
                return reject(err);
            });
        });
    },
    getFollowing: function(id){
        return new Promise((resolve, reject) =>{
            this.findById(id).populate("following", "_id username email")
            .then(user => {
                return resolve(user.following);
            })
            .catch(err =>{
                return reject(err);
            });
        });
    },
    getTweets: function(id){
        return new Promise((resolve, reject) =>{
            Tweet.find({user: id})
            .then(tweets => {
                return resolve(tweets);
            })
            .catch(err =>{
                return reject(err);
            })
        });
    }
};

const User = mongoose.model('user', userSchema);

module.exports = User;