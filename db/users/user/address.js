
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const Address = new Schema({
    street: String,
    city: String,
    state: String,
    zipcode: String
}, {_id: false});

module.exports = Address;