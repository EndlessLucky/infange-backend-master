const config = require("dotenv").config();
const mongoose = require("mongoose");
mongoose.Promise = Promise;
console.log("DB is", process.env.DB_URL);

var connectWithRetry = function () {
  return mongoose.connect(process.env.DB_URL, function (err) {
    if (err) {
      console.error(
        "Failed to connect to mongo on startup - retrying in 5 sec",
        err
      );
      setTimeout(connectWithRetry, 5000);
    }
  });
};
connectWithRetry();

// mongoose
//   .connect(process.env.DB_URL, {
//     newUrlParser: true,
//     reconnectTries: 100000,
//     auto_reconnect: true,
//     useFindAndModify: false,
//   })
//   .catch((err) => {
//     console.log("Unable to connect to db");
//     console.error(err);
//   });

const Token = require("./token");
const Client = require("./client");
const User = require("./user");

module.exports = {
  Client: mongoose.model("clients", Client),
  Token: mongoose.model("tokens", Token),
  User: mongoose.model("users", User),
  Schema: {
    Token,
    Client,
  },
};
