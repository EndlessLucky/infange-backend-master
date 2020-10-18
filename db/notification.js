const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const ObjectId = Schema.ObjectId;
const socketAPI = require("../socketAPI");
const emailAPI = require("../emailAPI");
const webpush = require("../webpush");

const getEmailLink = (eventName, id) => {
  const meetingURL = `${
    process.env.meetingURL || "http://localhost:3000/Meetings/"
  }${id}`;
  const objectiveURL = `${
    process.env.objectiveURL || "http://localhost:3000/Objectives/Edit/"
  }${id}`;
  

  const emailLinks = {
    meeting_created: meetingURL,
    meeting_invite_removed: meetingURL,
    meeting_invite_accepted: meetingURL,
    objective_updated: objectiveURL,
    objective_deleted: objectiveURL,
    meeting_reminder: meetingURL,
  };
  return emailLinks[eventName];
};

const Notification = new Schema({
  payload: {
    type: Object,
  },
  recipientId: {
    type: ObjectId,
  },
  read: {
    type: Boolean,
    default: false,
  },
  createDate: {
    type: Date,
    required: true,
    default: Date.now(),
  },
  trash: {
    type: Boolean,
  },
});

Notification.statics.trigger = async function (eventName, payload, recipients) {
  if (eventName !== "update_data") {
    await Promise.all(
      recipients.map(async (recipient) => {
        let notification = new this({
          payload,
          recipientId: recipient,
          createDate: Date.now(),
        });
        return notification.save();
      })
    );
  }
  socketAPI.sendNotification(eventName, payload, recipients);

  if (
    [
      "meeting_created",
      "meeting_invite_removed",
      "meeting_invite_accepted",
      "objective_updated",
      "objective_deleted",
      "meeting_reminder",
    ].includes(eventName)
  ) {
    try {
      const emailLink = getEmailLink(eventName, payload.id);
      emailAPI.send(payload, recipients, null, emailLink);
    } catch (e) {
      console.error(e);
    }
    try {
      webpush.send(payload, recipients);
    } catch (e) {
      console.error(e);
    }
  }
};

module.exports = mongoose.model("notifications", Notification);
