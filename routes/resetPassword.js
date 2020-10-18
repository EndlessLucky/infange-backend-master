// const express = require("express");
// const router = express.Router();
// const jwt = require("jsonwebtoken");
// const db = require("../db");
// const Client = db.Client;
// const emailAPI = require("../emailAPI");
// const auth = require("../auth");

// const secreteCode = process.env.Code || "aRandomSecretCode";

// router.get("/", async (req, res) => {
//   try {
//     const hostName = process.env.HOSTNAME || req.get("host");
//     const username = req.query.username;
//     const token = jwt.sign({ username }, secreteCode, { expiresIn: "1d" });
//     const protocol = process.env.HOST_PROTOCOL || req.protocol;
//     const url = req.protocol + "://" + hostName + "/reset/" + token;
//     emailAPI.send(
//       { message: `Click here to  <a href="${url}">reset password </a>` },
//       [username],
//       "reset_password"
//     );
//     return res.json({ message: "success" });
//   } catch (err) {
//     console.log("error sending email", err);
//     return res.status(400).json({ message: err });
//   }
// });

// router.post("/:token", async (req, res) => {
//   try {
//     const loggedUser = jwt.verify(req.params.token, secreteCode);
//     if (!loggedUser) return res.status(400).json({ message: "Not validate" });
//     if (req.body.password.length < 6 || req.body.password.length > 32)
//       return res
//         .status(400)
//         .send({ message: "Password must be between 6 and 32 characters" });
//     if (req.body.password !== req.body.confirmpwd)
//       return res.status(400).send({ message: "Password doesn't match" });
//     const hash = await auth.encrypt(req.body.password);
//     const update = await Client.updateOne(
//       {
//         username: loggedUser.username
//       },
//       {
//         password: hash
//       },
//       { new: true }
//     );
//     return res.json(update);
//   } catch (err) {
//     res
//       .status(400)
//       .json({ message: "Bad Request!! Check your verification link" });
//   }
// });

// module.exports = router;

const express = require("express");
const router = express.Router();
const jwt = require("jsonwebtoken");
const db = require("../db");
const Client = db.Client;
const emailAPI = require("../emailAPI");
const auth = require("../auth");

const secreteCode = process.env.Code || "aRandomSecretCode";

router.get("/", async (req, res) => {
  try {
    const hostName = process.env.HOSTNAME || req.get("host");
    const username = req.query.username;
    const token = jwt.sign({ username }, secreteCode, { expiresIn: "1d" });
    const protocol = process.env.HOST_PROTOCOL || req.protocol;
    const url = protocol + "://" + hostName + "/reset/" + token;
    emailAPI.send(
      { message: `Click here to  <a href="${url}">reset password </a>` },
      [username],
      "reset_password"
    );
    return res.json({ message: "success" });
  } catch (err) {
    console.log("error sending email", err);
    return res.status(400).json({ message: err });
  }
});

router.post("/:token", async (req, res) => {
  try {
    const loggedUser = jwt.verify(req.params.token, secreteCode);
    if (!loggedUser) return res.status(400).json({ message: "Not validate" });
    if (req.body.password.length < 6 || req.body.password.length > 32)
      return res
        .status(400)
        .send({ message: "Password must be between 6 and 32 characters" });
    if (req.body.password !== req.body.confirmpwd)
      return res.status(400).send({ message: "Password doesn't match" });
    const hash = await auth.encrypt(req.body.password);
    const update = await Client.updateOne(
      {
        username: loggedUser.username
      },
      {
        password: hash
      },
      { new: true }
    );
    return res.json(update);
  } catch (err) {
    res
      .status(400)
      .json({ message: "Bad Request!! Check your verification link" });
  }
});

module.exports = router;
