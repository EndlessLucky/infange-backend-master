const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const ObjectId = Schema.ObjectId;

const SubscriberSchema = new Schema({
  userId: {
    type: ObjectId
  },
  endpoint: String,
  keys: Schema.Types.Mixed,
  createDate: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model("subscribers", SubscriberSchema, "subscribers");
