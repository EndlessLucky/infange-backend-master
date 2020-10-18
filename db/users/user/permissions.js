
const mongoose = require('mongoose');
const Schema = mongoose.Schema;


const Permissions = new Schema({
    role: {
        type: String,
        required: true,
        enum: [ 'Owner', 'Admin', 'User' ]
    },
    billing: Boolean
})

module.exports = Permissions