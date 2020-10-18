const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const ObjectId = Schema.ObjectId;

const Token = new Schema({
    userID: {
        type: ObjectId,
        required: true,
        unique: true
    },
    tokens: [{
        tokenID: {
            type: String,
            required: true
        },
        createdOn: {
            type: Date,
            required: true,
            default: new Date()
        }
    }]
});

module.exports = Token;