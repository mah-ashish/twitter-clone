const mongoose = require('mongoose');

const Schema = mongoose.Schema;
const chatSchema = new Schema({
    body: {
        type: String,
        trim: true,
        required: true
    },
    sender: {
        type: Schema.Types.ObjectId,
        ref: 'user'
    },
    receiver: {
        type: Schema.Types.ObjectId,
        ref: 'user'
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

const Chat = mongoose.model('chat', chatSchema);

module.exports = Chat;