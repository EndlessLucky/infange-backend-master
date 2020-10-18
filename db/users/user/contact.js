
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const Contact = new Schema({
    type: {
        type: String,
        required: true,
        enum: ['phone','email','cell phone', 'home phone'],
    },
    info: String,
}, {_id: false})

module.exports = Contact;