
const mongoose = require('mongoose');
const Schema = mongoose.Schema,
      ObjectId = Schema.ObjectId;

const SharingToGuest = new Schema({

        userID: ObjectId,
        isReadOnly: {
            type: Boolean,
            required: true
        }  
          
    })
    
module.exports = SharingToGuest