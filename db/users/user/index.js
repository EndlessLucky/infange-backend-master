
const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const Address = require('./address');
const Contact = require('./contact');

const ObjectId = mongoose.Schema.Types.ObjectId;
// const Organization = require('../organization');

//TODO: figure out permissions


const User = new Schema({
    firstName:{
        type: String,
        required: true
    },
    lastName:{
        type: String,
        required: true
    },
    clientID: {
        type: ObjectId,
        ref: 'clients'
    },
    nickName: String,
    address: Address,
    contact: [Contact],
    createDate:{
        type: Date,
        required: true,
        default: new Date()
    },
    isPending: {
        type: Boolean,
        required: true,
        default: true,
    },
    verificationCode: String,
    organizationID: {
        type: ObjectId,
        required: true
    },
    organizationName: {
        type: String,
        required: true
    }
});

User.statics.findByOrganization = async function(orgID) {
    return this.find({organizationID: orgID});
}

User.statics.findByClient = async function(clientID) {
    return this.find({clientID});
}

User.statics.removeUser = async function(userID) {
    let user = await this.findOneById(userID);
    user.isPending = false;
    user.clientID = null;

    let userResult = await Promise.all(user.save());
    return userResult;
}


//module.exports.Address = Address;
//module.exports.Contact = Contact;
//module.exports = mongoose.model('users', User);


