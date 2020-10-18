const mongoose = require("mongoose");
const Schema = mongoose.Schema,
  ObjectId = Schema.ObjectId;

const Notes = new Schema({
  clientID: {
    type: ObjectId,
    required: true,
    ref: "users",
  },

  text: {
    type: String,
    required: true,
  },
  title: {
    type: String,
  },
  shared: [
    {
      type: ObjectId,
    },
  ],
  tags: {
    type: Array,
    default: [],
  },
  allowEdit: { type: Boolean, default: false },
  message: {
    type: String,
  },
  createDate: {
    type: Date,
    required: true,
    default: new Date(),
  },
  objectiveID: {
    type: ObjectId,
    ref: "objectives",
  },
  pinned: { type: Boolean, required: true, default: false },
  folder: {
    type: ObjectId,
    ref: "noteFolders",
  },
  objectiveID: {
    type: ObjectId,
    ref: "objectives",
  },
});

module.exports = mongoose.model("notes", Notes);
