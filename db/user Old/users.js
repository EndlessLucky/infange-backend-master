
const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const Address = require('./address');
const Contact = require('./contact');
const Permissions = require('./permissions');
const Organization = require('./userOrganization');

const Users = new Schema({
    firstName:{
        type: String,
        required: true
    },
    lastName:{
        type: String,
        required: true
    },
    address: Address,
    contact: [Contact],
    organizations: [Organization],
    permissions: {
        type: Permissions,
        required: true
    },
    createDate:{
        type: Date,
        required: true,
        default: new Date()
    }
});

module.exports = Users;


