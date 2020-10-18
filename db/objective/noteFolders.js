const mongoose = require("mongoose");
const Schema = mongoose.Schema,
  ObjectId = Schema.ObjectId;

const Folders = new Schema({
  orgID: {
    type: ObjectId,
    required: true,
    ref: "organizations",
  },
  name: {
    type: String,
    required: true,
    unique: true,
  },
  user: {
    type: ObjectId,
    required: true,
    ref: "users",
  },
});

module.exports = mongoose.model("noteFolders", Folders);
