const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const Address = require("./address");
const Contact = require("./contact");
const ObjectId = mongoose.Schema.Types.ObjectId;
const Organization = require("../organization");

//TODO: figure out permissions

// const Client = new Schema({
//     firstName:{
//         type: String,
//         required: true
//     },
//     lastName:{
//         type: String,
//         required: true
//     },
// });
//
// mongoose.model('clients', Client);

const User = new Schema({
  firstName: {
    type: String,
    required: true
  },
  lastName: {
    type: String,
    required: true
  },
  clientID: {
    type: ObjectId,
    ref: "clients"
  },
  nickName: String,
  address: Address,
  contact: [Contact],
  createDate: {
    type: Date,
    required: true,
    default: new Date()
  },
  isPending: {
    type: Boolean,
    required: true,
    default: true
  },
  verificationCode: String,
  organizationID: {
    type: ObjectId,
    ref: "organizations",
    required: true
  },
  organizationName: String,
});

User.statics.findByOrganization = async function(orgID) {
  return this.find({ organizationID: orgID });
};

User.statics.findByClient = async function(clientID) {
  return this.find({ clientID: clientID });
};

User.statics.removeUser = async function(userID) {
  let user = await this.findById(userID);
  let org = await Organization.findById(user.organizationID);
  user.isPending = false;
  user.clientID = null;

  org.roles = org.roles.map(x => x.users.filter(y => y !== userID));
  let [userResult, orgResult] = await Promise.all([user.save(), org.save()]);
  return userResult;
};

module.exports.Address = Address;
module.exports.Contact = Contact;
module.exports = User; //mongoose.model('users', User);
