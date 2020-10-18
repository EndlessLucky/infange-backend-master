// var express = require("express");
// var router = express.Router();
// const mongoose = require("mongoose");
// const db = require("../db");
// const Users = db.User;
// const ObjectId = mongoose.Types.ObjectId;
// const bcrypt = require("bcrypt");
// const User = db.Client;
// const Contact = require("../db/user/contact");
// const auth = require("../auth");
// const emailService = require("./emailServices");

// function validateEmail(email) {
//   var re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
//   return re.test(String(email).toLowerCase());
// }

// router.param("userID", async (req, res, next, uID) => {
//   if (!ObjectId.isValid(uID)) {
//     res.status(500).json({ message: "Invalid UserID" });
//   } else {
//     if ((await Users.count({ _id: uID })) > 0) {
//       req.userID = uID;
//       next();
//     } else {
//       res.sendStatus(404);
//     }
//   }
// });

// router.post("/", async (req, res, next) => {
//   try {
//     let user = new Users(req.body);
//     await user.save();
//     res.json(user);
//   } catch (err) {
//     next(err);
//   }
// });

// router.get("/", async (req, res, next) => {
//   try {
//     res.json(
//       await Users.find({
//         organizationID: { $in: req.user.map(x => x.organizationID) }
//       })
//     );
//   } catch (err) {
//     next(err);
//   }
// });

// router.get("/:userID", async (req, res, next) => {
//   try {
//     let user = await Users.findOne({ _id: req.userID });
//     user ? res.json(user) : res.sendStatus(404);
//   } catch (err) {
//     next(err);
//   }
// });

// router.put("/:userID", async (req, res, next) => {
//   try {
//     let m = await Users.updateOne(
//       {
//         _id: req.userID
//       },
//       req.body
//     );
//     m.n > 0 ? res.sendStatus(200) : res.sendStatus(400);
//   } catch (err) {
//     next(err);
//   }
// });

// router.post("/reset", async (req, res, next) => {
//   try {
//     console.log(
//       "here",
//       req.body,
//       await User.findOne({ _id: req.user[0]._id }),
//       req.user[0]
//     );
//     if (!validateEmail(req.body.username)) {
//       return res
//         .status(400)
//         .send({ message: "Please enter a valid email address" });
//     }
//     const client = await Users.aggregate([
//       {
//         $project: {
//           _id: "$_id",
//           clientID: "$clientID"
//         }
//       },
//       {
//         $match: {
//           _id: ObjectId(req.user[0]._id)
//         }
//       },
//       {
//         $lookup: {
//           from: "clients",
//           localField: "clientID",
//           foreignField: "_id",
//           as: "client"
//         }
//       }
//     ]);
//     if (!req.body.password || req.body.password === "") {
//       await User.findOneAndUpdate(
//         {
//           _id: client[0].client[0]._id
//         },
//         {
//           username: req.body.username
//         },
//         { new: true }
//       )
//         .then(async (success, err) => {
//           if (err) return res.status(400).json({ message: err });
//           await Users.updateOne(
//             { clientID: success._id, "contact.type": "email" },
//             { $set: { "contact.$.info": req.body.username } },
//             { new: true }
//           );
//         })
//         .catch(err => {
//           if (err.code === 11000)
//             return res.status(400).json({ message: "Username already exist" });
//           else next(err);
//         });
//       return res.json({ message: "success" });
//     }
//     if (req.body.newPassword.length < 6 || req.body.newPassword.length > 32) {
//       return res
//         .status(400)
//         .send({ message: "Password must be between 6 and 32 characters" });
//     }
//     if (req.body.newPassword !== req.body.confirmpassword) {
//       return res.status(400).send({ message: "Password doesn't match" });
//     }

//     await bcrypt.compare(
//       req.body.password,
//       client[0].client[0].password,
//       async (err, match) => {
//         if (err)
//           return res.status(400).send({ message: "password does not match" });
//         const hash = await auth.encrypt(req.body.newPassword);
//         const update = await User.updateOne(
//           {
//             _id: client[0].client[0]._id
//           },
//           {
//             username: req.body.username,
//             password: hash
//           },
//           { new: true }
//         );

//         return res.json(update);
//       }
//     );
//   } catch (err) {
//     next(err);
//   }
// });

// router.delete("/:userID", async (req, res, next) => {
//   try {
//     let m = await Users.deleteOne({ _id: req.userID });
//     m.n > 0 ? res.sendStatus(200) : res.sendStatus(400);
//   } catch (err) {
//     next(err);
//   }
// });

// module.exports = router;

var express = require("express");
var router = express.Router();
const mongoose = require("mongoose");
const db = require("../db");
const Users = db.User;
const ObjectId = mongoose.Types.ObjectId;
const bcrypt = require("bcrypt");
const User = db.Client;
const Contact = require("../db/user/contact");
const auth = require("../auth");
const emailService = require("./emailServices");

function validateEmail(email) {
  var re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
  return re.test(String(email).toLowerCase());
}

router.param("userID", async (req, res, next, uID) => {
  if (!ObjectId.isValid(uID)) {
    res.status(500).json({ message: "Invalid UserID" });
  } else {
    if ((await Users.count({ _id: uID })) > 0) {
      req.userID = uID;
      next();
    } else {
      res.sendStatus(404);
    }
  }
});

router.post("/", async (req, res, next) => {
  try {
    let user = new Users(req.body);
    await user.save();
    res.json(user);
  } catch (err) {
    next(err);
  }
});

router.get("/", async (req, res, next) => {
  try {
    res.json(
      await Users.aggregate([
        {
          $project: {
            clientID: "$clientID",
            organizationID: "$organizationID",
            root: "$$ROOT"
          }
        },
        {
          $match: {
            organizationID: {
              $in: req.user.map(x => ObjectId(x.organizationID))
            }
          }
        },
        {
          $lookup: {
            from: "clients",
            localField: "clientID",
            foreignField: "_id",
            as: "client"
          }
        },
        { $unwind: "$client" },
        {
          $project: {
            emailConfirmed: "$client.emailConfirmed",
            root: "$root"
          }
        },
        {
          $match: {
            emailConfirmed: true
          }
        },
        { $replaceRoot: { newRoot: "$root" } }
      ])
    );
  } catch (err) {
    next(err);
  }
});

router.get("/:userID", async (req, res, next) => {
  try {
    let user = await Users.findOne({ _id: req.userID });
    user ? res.json(user) : res.sendStatus(404);
  } catch (err) {
    next(err);
  }
});

router.put("/:userID", async (req, res, next) => {
  try {
    let m = await Users.updateOne(
      {
        _id: req.userID
      },
      req.body
    );
    m.n > 0 ? res.sendStatus(200) : res.sendStatus(400);
  } catch (err) {
    next(err);
  }
});

router.post("/reset", async (req, res, next) => {
  try {
    if (!validateEmail(req.body.username)) {
      return res
        .status(400)
        .send({ message: "Please enter a valid email address" });
    }
    const client = await Users.aggregate([
      {
        $project: {
          _id: "$_id",
          clientID: "$clientID"
        }
      },
      {
        $match: {
          _id: ObjectId(req.user[0]._id)
        }
      },
      {
        $lookup: {
          from: "clients",
          localField: "clientID",
          foreignField: "_id",
          as: "client"
        }
      }
    ]);
    if (!req.body.password || req.body.password === "") {
      const userExist = await User.findOne({ username: req.body.username });
      if (userExist)
        return res.status(400).json({ message: "Username already exist" });

      const reqParams = {
        username: req.body.username,
        host: req.get("host"),
        protocol: req.protocol,
        query: {},
        userId: client[0].client[0]._id
      };
      await emailService.createVerificationLink(reqParams);
      return res.json({ message: "success" });
    }
    if (req.body.newPassword.length < 6 || req.body.newPassword.length > 32) {
      return res
        .status(400)
        .send({ message: "Password must be between 6 and 32 characters" });
    }
    if (req.body.newPassword !== req.body.confirmpassword) {
      return res.status(400).send({ message: "Password doesn't match" });
    }
    await bcrypt.compare(
      req.body.password,
      req.body.newPassword,
      async (err, match) => {
        if (match) {
          return res
            .status(400)
            .send({ message: "New password should be different" });
        }
      }
    );

    await bcrypt.compare(
      req.body.password,
      client[0].client[0].password,
      async (err, match) => {
        if (err) return res.status(400).send({ message: err });
        if (match) {
          const hash = await auth.encrypt(req.body.newPassword);
          const update = await User.updateOne(
            {
              _id: client[0].client[0]._id
            },
            {
              username: req.body.username,
              password: hash
            },
            { new: true }
          );

          return res.json(update);
        } else {
          return res.status(400).send({ message: "password does not match" });
        }
      }
    );
  } catch (err) {
    next(err);
  }
});

router.delete("/:userID", async (req, res, next) => {
  try {
    let m = await Users.deleteOne({ _id: req.userID });
    m.n > 0 ? res.sendStatus(200) : res.sendStatus(400);
  } catch (err) {
    next(err);
  }
});

module.exports = router;
