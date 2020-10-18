// const jwt = require("jsonwebtoken");
// const db = require("../db");
// const Client = db.Client;
// const Users = db.User;
// const emailAPI = require("../emailAPI");

// const secreteCode = process.env.Code || "aRandomSecretCode";

// const createVerificationLink = async (req, res) => {
//   try {
//     let hostName, username;
//     if (req.query.username) {
//       hostName = process.env.HOSTNAME || req.get("host");
//       username = req.query.username;
//       const user = await Client.findOne({ username });
//       if (!user)
//         return res.status(400).json({ message: "User does not exist" });
//     } else {
//       hostName = req.host;
//       username = req.username;
//     }
//     const emailToken = jwt.sign({ username }, secreteCode, { expiresIn: "1d" });
//     const protocol = process.env.HOST_PROTOCOL || req.protocol;
//     const url = protocol + "://" + hostName + "/api/emailVerify/" + emailToken;
//     emailAPI.send(
//       { message: `Click here to  <a href="${url}">verify </a>` },
//       [username],
//       "Verify"
//     );

//     if (req.query.username) return res.json({ message: "success" });
//     return "success";
//   } catch (err) {
//     console.log("error while sending email", err);
//     if (req.query.username) return res.status(400).json({ message: err });
//     return "failed to send";
//   }
// };

// const verifyEmail = async (req, res) => {
//   try {
//     const loggedUser = jwt.verify(req.params.emailToken, secreteCode);
//     const user = await Client.findOneAndUpdate(
//       { username: loggedUser.username },
//       {
//         $set: {
//           emailConfirmed: true
//         }
//       }
//     );
//     if (!user) return res.status(400).json({ message: err });
//     else {
//       const redirectURL =
//         process.env.REDIRECT_URL || "http://localhost:3000/login";
//       res.redirect(redirectURL);
//     }
//   } catch (err) {
//     res.status(400).json({ message: err });
//   }
// };

// module.exports = {
//   createVerificationLink,
//   verifyEmail
// };

const jwt = require("jsonwebtoken");
const db = require("../db");
const Client = db.Client;
const Users = db.User;
const emailAPI = require("../emailAPI");

const secreteCode = process.env.Code || "aRandomSecretCode";

const createVerificationLink = async (req, res) => {
  try {
    let hostName, username;
    if (req.query.username) {
      hostName = process.env.HOSTNAME || req.get("host");
      username = req.query.username;
      const user = await Client.findOne({ username });
      if (!user)
        return res.status(400).json({ message: "User does not exist" });
    } else {
      hostName = req.host;
      username = req.username;
    }
    const sign = { username };
    if (req.userId) sign.userId = req.userId;
    const emailToken = jwt.sign({ username }, secreteCode, { expiresIn: "1d" });
    const protocol = process.env.HOST_PROTOCOL || req.protocol;
    const url = protocol + "://" + hostName + "/api/emailVerify/" + emailToken;
    emailAPI.send(
      { message: `Click here to  <a href="${url}">verify </a>` },
      [username],
      "Verify"
    );

    if (req.query.username) return res.json({ message: "success" });
    return "success";
  } catch (err) {
    console.log("error while sending email", err);
    if (req.query.username) return res.status(400).json({ message: err });
    return "failed to send";
  }
};

const verifyEmail = async (req, res) => {
  try {
    const loggedUser = jwt.verify(req.params.emailToken, secreteCode);
    if (loggedUser.userId) {
      await Client.findOneAndUpdate(
        {
          _id: loggedUser.userId
        },
        {
          username: loggedUser.username
        },
        { new: true }
      )
        .then(async (success, err) => {
          if (err) return res.status(400).json({ message: err });
          await Users.updateOne(
            { clientID: success._id, "contact.type": "email" },
            { $set: { "contact.$.info": loggedUser.username } },
            { new: true }
          );
        })
        .catch(err => {
          if (err.code === 11000)
            return res.status(400).json({ message: "Username already exist" });
          else next(err);
        });
      const redirectURL =
        process.env.REDIRECT_URL || "http://localhost:3000/login";
      return res.redirect(redirectURL);
    }
    const user = await Client.findOneAndUpdate(
      { username: loggedUser.username },
      {
        $set: {
          emailConfirmed: true
        }
      }
    );
    if (!user) return res.status(400).json({ message: err });
    else {
      const redirectURL =
        process.env.REDIRECT_URL || "http://localhost:3000/login";
      res.redirect(redirectURL);
    }
  } catch (err) {
    res.status(400).json({ message: err });
  }
};

module.exports = {
  createVerificationLink,
  verifyEmail
};
