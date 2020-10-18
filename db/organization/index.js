const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const Role = require("./role");
const ObjectId = Schema.ObjectId;
const User = require("../user");

const Organization = new Schema({
  name: {
    type: String,
    required: true
  },
  roles: [Role],
  // TODO: we cant have settings because they may conflict from organization to organization
  // settings: {
  //     type: Settings,
  //     required: true,
  //     default: {
  //         timeout: 0,
  //         useNickname: false,
  //         passwordAttempts: 10
  //     }
  // },
  ownerID: {
    type: ObjectId,
    required: true,
    ref: "users"
  },
  tags: {
    type: Array,
    default: []
  }
});

Organization.statics.addRole = async function(orgID, role) {
  return await this.updateOne({ _id: orgID }, { roles: { $addToSet: role } });
};

Organization.statics.updateRole = async function(orgID, role) {
  let org = await this.findOneById(orgID);
  org.roles = org.roles.map(x => (x._id === role._id ? role : x));
  return org.save();
};

Organization.statics.getRole = async function(orgID, roleID) {
  let org = await this.findOne({ _id: orgID });
  if (org) {
    return org.roles.find(x => x._id.toString() === roleID.toString());
  }
  return null;
};

Organization.statics.getRoles = async function(orgID) {
  let org = await this.findOne({ _id: orgID });
  return org.roles;
};

Organization.statics.removeRole = async function(orgID, roleID) {
  return this.updateOne({ _id: orgID }, { roles: { $pull: { _id: roleID } } });
};

// Organization.statics.moveRoleToDepartment = async function(orgID, roleID, fromDeptID, toDeptID) {
//     let org = await this.findOne({_id: orgID, departments: [fromDeptID, toDeptID]});
//     if(!org) return false;
//
//     let fromDept = org.departments.find(x => x._id.toString() === fromDeptID);
//     let toDept = org.departments.find(x => x._id.toString() === toDeptID);
//     let role = fromDept.roles.find(x => x._id.toString() === roleID);
//     if(!role) return false;
//
//     fromDept.roles = fromDept.roles.filter(x => x !== role);
//     toDept.roles.push(role);
//
//     return org.save();
// };
//
// Organization.statics.addDepartment = async function(orgID, dept) {
//     let org = await this.findById(orgID);
//     org.departments.push(dept);
//     await org.save();
//     return org.departments[org.departments.length - 1];
// }
//
// Organization.statics.removeDepartment = async function(orgID, deptID) {
//     return this.updateOne({_id: orgID}, {departments: {$pull: {_id: deptID}}});
// }

module.exports = mongoose.model("organizations", Organization);
module.exports.Schema = Organization;
