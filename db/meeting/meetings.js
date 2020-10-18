const mongoose = require("mongoose");
const Agenda = require("./agenda");
const Objective = require("../objective/objective");

const Schema = mongoose.Schema,
  ObjectId = Schema.ObjectId;

const Meetings = new Schema(
  {
    assigneeID: ObjectId,
    createDate: {
      type: Date,
      required: true,
      default: Date.now(),
    },
    startDate: {
      type: Date,
      required: true,
    },
    endDate: {
      type: Date,
      required: true,
    },
    invitees: [
      {
        userID: {
          type: ObjectId,
          ref: "users",
        },
        requestStatus: {
          type: String,
          default: "Pending",
          enum: ["Accept", "Decline", "Pending"],
        },
        userName: {
          type: String,
        },
        isAgreed: {
          type: Boolean,
          required: false,
        },
        isMeetingEndAgreed: {
          type: Boolean,
          required: false,
        },
      },
    ],
    status: {
      type: String,
      defaultValue: "Scheduled",
      enum: ["Pending", "Cancelled", "InProgress", "Ended", "Missed"],
    },
    tags: {
      type: Array,
      default: [],
    },
    location: {
      type: String,
      default: false,
      required: true,
    },
    title: {
      type: String,
      required: true,
    },
    ownerID: {
      type: ObjectId,
      required: true,
    },
    agendas: [Agenda],
    organizationID: ObjectId,
    duration: {
      type: String,
    },
    meetingNotesConfirmationSent: {
      type: Boolean,
      default: false,
    },
    meetingEndRequester: {
      type: ObjectId,
      ref: "users",
    },
    purpose: {
      type: String,
    },
    objectives: [{ type: Schema.Types.ObjectId, ref: "objectives" }],
    oldMeetings: [{ type: Schema.Types.ObjectId, ref: "Meetings" }],
  },
  { minimize: false }
);

Meetings.methods.addInvitees = async function (invitees) {
  let newInvitees = invitees.map((x) => ({
    userID: x.userID,
    userName: x.userName,
    isAgreed: false,
    requestStatus: "Pending",
  }));
  newInvitees.map((n) => {
    if (
      !this.invitees.find((x) => x.userID.toString() === n.userID.toString())
    ) {
      this.invitees.push(n);
    } else {
      throw new Error("invitee already exists");
    }
  });
};

Meetings.statics.removeInvitee = async function (meetingID, inviteeID) {
  let mtng = await this.findById(meetingID);
  let idx = mtng.invitees.findIndex(
    (invitee) => invitee.userID.toString() === inviteeID
  );
  if (mtng && idx >= 0) {
    mtng.invitees.splice(idx, 1);
    console.log(mtng.invitees);
    mtng.save();
  } else if (!mtng) {
    throw new Error("Invalid Meeting ID");
  } else {
    throw new Error("Invalid Invitee ID");
  }
};

module.exports = mongoose.model("meetings", Meetings);
