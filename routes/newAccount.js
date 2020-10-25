var express = require("express");
var router = express.Router();
const auth = require("../auth");
const randtoken = require("rand-token");
const db = require("../db");
const Token = db.Token;
const User = db.User;
const Client = db.Client;
const emailService = require("./emailServices");

function validateEmail(email) {
  var re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
  return re.test(String(email).toLowerCase());
}

//Creating a record
router.post("/", async (req, res) => {
  try {
    if (!validateEmail(req.body.username)) {
      return res
        .status(400)
        .send({ message: "Please enter a valid email address" });
    }

    if (req.body.password.length < 6 || req.body.password.length > 32) {
      return res
        .status(400)
        .send({ message: "Password must be between 6 and 32 characters" });
    }

    if (req.body.password !== req.body.confirmpassword) {
      return res.status(400).send({ message: "Password doesn't match" });
    }

    let p = await auth.encrypt(req.body.password);
    let c = new Client({ ...req.body, password: p });
    await c.save();

    let n = new User({
      clientID: c._id,
      firstName: c.firstName,
      lastName: c.lastName,
      address: {},
      organizationID: "5b2a63078f565c741c141482",
      organizationName: "NetpayAdvance",
      contact: {
        type: "email",
        info: c.username,
      },
    });
    await n.save();
    const reqParams = {
      username: req.body.username,
      host: process.env.HOSTNAME || req.get("host"),
      protocol: process.env.HOST_PROTOCOL || req.protocol,
      query: {},
    };
    await emailService.createVerificationLink(reqParams);
    res.json({ message: "success" });
  } catch (err) {
    if (err.errmsg && err.errmsg.includes("duplicate")) {
      let message = "An account with this email is already taken";
      res.status(400).send({ message });
    } else {
      res.status(400).send({ message: err.errmsg });
    }
  }
});

module.exports = router;
