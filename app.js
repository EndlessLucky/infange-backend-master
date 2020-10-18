const createError = require("http-errors");
const express = require("express");
const path = require("path");
const cookieParser = require("cookie-parser");
const bodyParser = require("body-parser");
const logger = require("morgan");
const user = require("./routes/user");
const objectives = require("./routes/objectives");
const notes = require("./routes/notes");
const mongoose = require("mongoose");
// const comments = require("../db/comments");
// const Comments = require("./comments").Comments;
const Schema = mongoose.Schema;
const ObjectId = mongoose.Types.ObjectId;
const authRoute = require("./routes/auth");
const app = express();
const meetings = require("./routes/meeting");
const documents = require("./routes/document");
const Users = require("./db").User;
const auth = require("./auth");
const authMiddleware = require("./middleware");
const emailService = require("./routes/emailServices");
const webpush = require("web-push");
const resetPwd = require("./routes/resetPassword");

// Private push key: v-7uzeNZBMMu9mOeQQNFgXS9bbs8bz5T3HGQekSSTsk

const publicKey =
  "BBllMPpt4bWtP82cpfErhQbrC9Z-s8qZvi8DhVObOTgHFfpEfTUOTeO-0-qUrMWEwzT6rXxrUajDhb2IYc2Dmbc";
const privateKey = "KaWAoX_s2YJUEuN2NQ3VS43zIVbt_ma6qwepacrUYbA";

webpush.setVapidDetails(
  "mailto:medhachereddy@netpayadvance.com",
  publicKey,
  privateKey
);

const organizations = require("./routes/organization");

// view engine setup
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "pug");

//Handle File uploads
//app.use(multer({ dest: './uploads' }));
const allowCrossDomain = function (req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Methods", "GET,PUT,POST,DELETE");
  res.header("Access-Control-Allow-Headers", "Content-Type,Authorization");

  next();
};

app.use(cookieParser());

const validClientID = async (req, res, next) => {
  let user = null;
  if (
    !ObjectId.isValid(req.params.userID) ||
    !(user = await User.findOne({ clientID: req.params.userID }))
  ) {
    res
      .status(404)
      .send({ message: `User ${req.params.userID} does not exist` });
  } else {
    req.organizationID = user.organizationID;
    req.userID = user._id;
    next();
  }
};

const getOrgs = async (req, res, next) => {
  req.organizations = req.user.map((x) => x.organizationID);
  next();
};

app.use(logger("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, "public")));
app.use(allowCrossDomain);

app.use("/api", authRoute);
app.use(
  "/api/upload",
  (req, res, next) => {
    res.header("Access-Control-Allow-Origin", "*");
    next();
  },
  require("./routes/editorImages")
);
app.use("/api/newAccount", require("./routes/newAccount"));
app.use("/api/emailVerify/:emailToken", emailService.verifyEmail);
app.use("/api/resend", emailService.createVerificationLink);
app.use("/api/reset", resetPwd);

// Authenticated user routes

app.use(
  "/api/meetings",
  authMiddleware.token,
  authMiddleware.cookie,
  authMiddleware.auth,
  getOrgs,
  meetings
);
app.use(
  "/api/documents",
  authMiddleware.token,
  authMiddleware.cookie,
  authMiddleware.auth,
  getOrgs,
  documents
);

app.use(
  "/api/organizations",
  authMiddleware.token,
  authMiddleware.cookie,
  authMiddleware.auth,
  getOrgs,
  organizations
);

app.use(
  "/api/objectives",
  authMiddleware.token,
  authMiddleware.cookie,
  authMiddleware.auth,
  getOrgs,
  objectives
);

app.use("/api/users", async (req, res, next) => {
  res.json(await Users.find());
});
app.use(
  "/api/notes",
  authMiddleware.token,
  authMiddleware.cookie,
  authMiddleware.auth,
  getOrgs,
  notes
);
app.use(
  "/api/notifications",
  authMiddleware.token,
  authMiddleware.cookie,
  authMiddleware.auth,
  require("./routes/notifications")
);
app.use(
  "/api/Account",
  authMiddleware.token,
  authMiddleware.cookie,
  authMiddleware.auth,
  getOrgs
);
app.use(
  "/api/Account/Search",
  authMiddleware.token,
  authMiddleware.cookie,
  authMiddleware.auth,
  require("./routes/search")
);
app.use(
  "/api/Account/users/current",
  authMiddleware.token,
  authMiddleware.cookie,
  authMiddleware.auth,
  (req, res) => {
    res.json(req.user);
  }
);
app.use(
  "/api/Account/Users",
  authMiddleware.token,
  authMiddleware.cookie,
  authMiddleware.auth,
  user
);
app.use("/api/Account/:orgID/Avatar", require("./routes/avatar"));
//app.use('/avatar', auth.token.middleware.authorize, upload.single('file'), require('./routes/avatar'));

// catch 404 and forward to error handler
app.use(function (req, res, next) {
  next(createError(404));
});

// error handler
app.use(function (err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get("env") === "development" ? err : {};
  // render the error page
  res.status(err.status || 500);
  res.json({ message: err.message });
  //res.render("error");
});

module.exports = app;
