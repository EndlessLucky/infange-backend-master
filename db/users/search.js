const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const ObjectId = mongoose.Schema.Types.ObjectId;

const Users = new Schema({
  firstName: String,
  lastName: String,
  nickName: String,
  score: String,
  createDate: Date,
  organizationID: ObjectId,
  _id: ObjectId,
});

const Meetings = new Schema({
  ownerID: ObjectId,
  invitees: [
    {
      userID: {
        type: ObjectId,
        required: true,
        ref: "users",
      },
    },
  ],
  title: String,
  text: String,
  source: String,
  score: String,
  createDate: Date,
  organizationID: ObjectId,
  _id: ObjectId,
});

const Objectives = new Schema({
  title: String,
  text: String,
  source: String,
  score: String,
  createDate: Date,
  organizationID: ObjectId,
  _id: ObjectId,
});

const Notes = new Schema({
  title: String,
  text: String,
  source: String,
  score: String,
  createDate: Date,
  clientID: ObjectId,
  _id: ObjectId,
});

Users.static("textSearch", async function (profile, search) {
  let users = await this.find(
    {
      organizationID: { $in: profile.map((x) => x.organizationID) },
      $or: [
        { firstName: { $regex: `.*${search}`, $options: "i" } },
        { lastName: { $regex: `.*${search}`, $options: "i" } },
      ],
    },
    { score: { $meta: "textScore" } },
    { limit: 10, sort: { score: { $meta: "textScore" } } }
  );
  return users.map((x) => {
    return {
      title: `${x.firstName} ${x.lastName}`,
      text: x.nickName,
      source: "Users",
      score: x.score,
      createDate: x.createDate,
      _id: x._id,
    };
  });
});

Meetings.static("textSearch", async function (profile, search) {
  let mt = await this.find(
    {
      organizationID: { $in: profile.map((x) => x.organizationID) },
      $or: [
        { ownerID: { $in: profile.map((x) => x.clientID) } },
        { "invitees.userID": { $in: profile.map((x) => x._id) } },
      ],
      title: { $regex: `.*${search}`, $options: "i" },
    },
    { score: { $meta: "textScore" } },
    { limit: 10, sort: { score: { $meta: "textScore" } } }
  );
  return mt.map((x) => {
    return {
      title: x.title,
      text: x.text,
      source: "Meetings",
      score: x.score,
      createDate: x.createDate,
      _id: x._id,
    };
  });
});

Objectives.static("textSearch", async function (profile, search) {
  let ob = await this.find(
    {
      organizationID: { $in: profile.map((x) => x.organizationID) },
      description: { $regex: `.*${search}`, $options: "i" },
    },
    { score: { $meta: "textScore" } },
    { limit: 10, sort: { score: { $meta: "textScore" } } }
  );
  return ob.map((x) => {
    x["source"] = "Objectives";
    return x;
  });
});

Notes.static("textSearch", async function (profile, search) {
  let nt = await this.find(
    {
      clientID: { $in: profile.map((x) => x.clientID) },
      title: { $regex: `.*${search}`, $options: "i" },
    },
    { score: { $meta: "textScore" } },
    { limit: 10, sort: { score: { $meta: "textScore" } } }
  );
  return nt.map((x) => {
    return {
      title: x.title,
      text: x.text,
      source: "Notes",
      score: x.score,
      createDate: x.createDate,
      _id: x._id,
    };
  });
});

module.exports = {
  Meetings: mongoose.model("searchMeetings", Meetings, "meetings"),
  Objectives: mongoose.model("searchObjectives", Objectives, "objectives"),
  Notes: mongoose.model("searchNotes", Notes, "notes"),
  Users: mongoose.model("searchUsers", Users, "users"),
};
