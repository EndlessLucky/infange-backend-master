const mongoose = require("mongoose");
const User = require("./user");
const conn = mongoose.connect("mongodb://admin:SnY4h3ZtHDyXuBy9@NPA35", {
  dbName: "loci",
  reconnectTries: 100000,
  autoReconnect: "true",
});

module.exports = {
  User,
  Schema: {
    Contact: User.Contact,
    Address: User.Address,
  },
};
