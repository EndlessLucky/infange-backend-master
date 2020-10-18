const mongoose = require("mongoose");
const Schema = mongoose.Schema,
  ObjectId = Schema.ObjectId;

const Attachment = new Schema({
  filename: {
    type: String,
    required: true,
  },
  fsID: {
    type: ObjectId,
    required: true,
  },
});

const Agenda = new Schema(
  {
    createdOn: {
      type: Date,
      default: new Date(),
      required: true,
    },
    type: {
      type: String,
      enum: ["Topic", "Question", "Objective"],
      required: true,
    },
    doc: {
      type: String,
      required: true,
    },
    ownerID: {
      type: ObjectId,
      required: true,
    },
    comments: [
      {
        ownerID: {
          type: ObjectId,
          required: true,
        },
        createdOn: {
          type: Date,
          default: new Date(),
          required: true,
        },
        doc: {
          type: String,
          required: true,
        },
      },
    ],
    attachments: [Attachment],
    agenda: {
      type: String,
    },
    objectiveID: [
      {
        type: Object,
        // required: true,
        // default: {}
      },
    ],
    discussed: { type: Boolean, default: false },
    order: Number,
    indent: Number,
  },
  { minimize: false }
);

module.exports = Agenda;
