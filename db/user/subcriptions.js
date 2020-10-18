const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const Subscription = new Schema({
    clientID: {
        type: ObjectId,
        ref: "clients"
    },
    subscriptions: [String]
});

module.exports = Subscription;