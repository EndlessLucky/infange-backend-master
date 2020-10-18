const mongoose = require('mongoose');
const Schema = mongoose.Schema,
    ObjectId = Schema.ObjectId;

const Roles = new Schema({
    name: {
        type: String,
        required: true
    },

    users: [{
        type: ObjectId,
        ref: 'users'
    }],

    department: String,
    path: String
});

module.exports = Roles;
