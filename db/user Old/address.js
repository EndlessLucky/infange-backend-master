
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const Address = new Schema({
    street: String,
    city: String,
    state: String,
    zipCode: String
})

module.exports = Address;