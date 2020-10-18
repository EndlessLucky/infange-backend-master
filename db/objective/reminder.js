const mongoose = require("mongoose");
const Schema = mongoose.Schema,
  ObjectId = Schema.ObjectId;

const Reminder = new Schema({
  description: { type: String, required: true },
  dueDate: { type: Date, required: true },
  objID: { type: ObjectId, ref: "objectives" },
  assigneeID: { type: ObjectId, ref: "users" },
  targetTime: { type: Date },
  isRemoved: { type: Boolean, required: true, default: false },
});

module.exports = mongoose.model("reminders", Reminder);
