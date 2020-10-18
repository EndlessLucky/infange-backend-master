const mongoose = require("mongoose");
const conn = mongoose.connect("mongodb://admin:SnY4h3ZtHDyXuBy9@NPA35", {
  dbName: "loci",
  reconnectTries: 100000,
  autoReconnect: true,
});

const Document = require("./documents");
const Meeting = require("./meetings");
const MeetingTopics = require("./meetingTopics");
// const SupportingItems = require('./supportingItems');

module.exports = {
  Document,
  Meeting,
  MeetingTopics,
  // , SupportingItems
};
