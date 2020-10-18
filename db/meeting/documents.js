const mongoose = require('mongoose');
const SharingToGuest = require('./sharingToGuest');
const Schema = mongoose.Schema,
      ObjectId = Schema.ObjectId;

const Documents = new Schema({

    userID: {
        type: ObjectId,
        required: true
    },

    path: {
        type: String,
        required: true
    },

    sharingToGuest: SharingToGuest,

    document: {
        type: Object,
        required: true
    },

    meetingID: {
        type: ObjectId,
        required: true
    }
       
});
    
module.exports = mongoose.model('documents', Documents);