const mongoose = require("mongoose");
const Meetings = require("../meeting/meetings");

const Schema = mongoose.Schema,
  ObjectId = Schema.ObjectId;

const Objectives = new Schema({
  assigneeID: {
    type: ObjectId,
    required: true,
  },
  ownerID: {
    type: ObjectId,
    required: true,
  },
  description: {
    type: String,
  },
  status: {
    type: String,
    default: "Pending",
  },
  history: [
    {
      modifiedBy: {
        type: ObjectId,
        required: true,
      },
      type: {
        type: String,
        required: true,
        enum: ["Owner", "Status", "dueDate", "Assignee", "Text"],
      },
      oldValue: {
        type: String,
        required: true,
      },
      newValue: {
        type: String,
        required: true,
      },
      createDate: {
        type: Date,
        required: true,
        default: Date.now(),
      },
    },
  ],
  tags: {
    type: Array,
    default: [],
    required: true,
  },
  createDate: {
    type: Date,
    required: true,
    default: Date.now(),
  },
  assignedBy: {
    type: ObjectId,
  },
  dueDate: {
    type: Date,
    required: true,
  },
  agenda: {
    type: Object,
  },
  reminder: {
    type: Boolean,
    default: false,
  },
  days: {
    type: Number,
  },
  completedDate: {
    type: Date,
    // required: true,
    // default: new Date(),
  },
  organizationID: ObjectId,
  meetings: [{ type: Schema.Types.ObjectId, ref: "meetings" }],
});

module.exports = mongoose.model("objectives", Objectives);
