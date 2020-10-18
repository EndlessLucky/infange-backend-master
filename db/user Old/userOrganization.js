
const mongoose = require('mongoose');
const Schema = mongoose.Schema,
      ObjectId = Schema.ObjectId;

const Organization = new Schema({
   
    organizationID: {
        type: ObjectId,
        required: true
    },
    
    roles: [{
        type: ObjectId,
        required: true
    }]

});

module.exports = Organization;