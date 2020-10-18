// var express = require("express");
// var router = express.Router();
// const auth = require("../auth");
// const tokenAuth = require("../auth");
// const randtoken = require("rand-token");
// const db = require("../db");
// const Token = db.Token;
// const User = db.User;

// //Creating a record
// router.post("/login", async (req, res) => {
//   try {
//     let user = await auth.login(req.body.username, req.body.password);
//     console.log("sser", user);
//     if (!user.emailConfirmed) {
//       res.status(400).json({ message: "Email not verified" });
//     }
//     if (user) {
//       let refreshToken = randtoken.uid(256);
//       let clientToken = await Token.findOne({ userID: user._id });
//       if (!clientToken) {
//         clientToken = new Token({ userID: user._id, tokens: [] });
//       }
//       clientToken.tokens.push({ tokenID: refreshToken });
//       if (clientToken.tokens.length > 10) {
//         clientToken.tokens.shift();
//       }
//       await clientToken.save();

//       let token = await newToken(user._id, refreshToken);
//       res.cookie(
//         "loci_auth",
//         { userID: user._id, token: token, refreshToken: refreshToken },
//         { expires: new Date(253402300000000), httpOnly: true }
//       );
//       //res.set('set-cookie', `token=Bearer ${token}`);
//       res.json({ token, refreshToken });
//     } else res.status(400).json({ message: "Invalid Username or Password" });
//   } catch (err) {
//     console.log("inval");
//     res.status(400).json({ message: "Invalid Username or Password" });
//   }
// });

// router.get("/token", async (req, res, next) => {
//   try {
//     if (req.cookies.refresh_token) {
//       const rt = req.cookies.refresh_token;
//       let token = await newToken(rt.userID, rt.refreshToken);
//       if (!token) {
//         res.sendStatus(401);
//       } else {
//         res.json({ token: token });
//       }
//     } else {
//       res.sendStatus(401);
//     }
//   } catch (err) {
//     res.status(401).send(err);
//   }
// });

// router.post("/token", async (req, res, next) => {
//   try {
//     let token = await newToken(req.body.userID, req.body.refreshToken);
//     if (!token) {
//       res.sendStatus(401);
//     } else {
//       res.json({ token: token });
//     }
//   } catch (err) {
//     res.status(401).send(err);
//   }
// });

// async function newToken(userID, refreshToken) {
//   if (await Token.findOne({ userID: userID, "tokens.tokenID": refreshToken })) {
//     let user = await User.findByClient(userID);
//     return tokenAuth.sign(userID, user, 60 * 60);
//   } else {
//     throw Error("Unauthorized access");
//   }
// }

// module.exports = router;

var express = require("express");
var router = express.Router();
const auth = require("../auth");
const tokenAuth = require("../auth");
const randtoken = require("rand-token");
const db = require("../db");
const Token = db.Token;
const User = db.User;

//Creating a record
router.post("/login", async (req, res) => {
  try {
    let user = await auth.login(req.body.username, req.body.password);
    console.log("sser", user);
    if (!user.emailConfirmed) {
      res.status(400).json({ message: "Email not verified" });
    }
    if (user) {
      let refreshToken = randtoken.uid(256);
      let clientToken = await Token.findOne({ userID: user._id });
      if (!clientToken) {
        clientToken = new Token({ userID: user._id, tokens: [] });
      }
      clientToken.tokens.push({ tokenID: refreshToken });
      if (clientToken.tokens.length > 10) {
        clientToken.tokens.shift();
      }
      await clientToken.save();

      let token = await newToken(user._id, refreshToken);
      res.cookie(
        "loci_auth",
        { userID: user._id, token: token, refreshToken: refreshToken },
        { expires: new Date(253402300000000), httpOnly: true }
      );
      //res.set('set-cookie', `token=Bearer ${token}`);
      res.json({ token, refreshToken });
    } else res.status(400).json({ message: "Invalid Username or Password" });
  } catch (err) {
    console.log("inval");
    res.status(400).json({ message: "Invalid Username or Password" });
  }
});

router.get("/token", async (req, res, next) => {
  try {
    if (req.cookies.refresh_token) {
      const rt = req.cookies.refresh_token;
      let token = await newToken(rt.userID, rt.refreshToken);
      if (!token) {
        res.sendStatus(401);
      } else {
        res.json({ token: token });
      }
    } else {
      res.sendStatus(401);
    }
  } catch (err) {
    res.status(401).send(err);
  }
});

router.post("/token", async (req, res, next) => {
  try {
    let token = await newToken(req.body.userID, req.body.refreshToken);

    if (!token) {
      res.sendStatus(401);
    } else {
      res.json({ token: token });
    }
  } catch (err) {
    res.status(401).send(err);
  }
});

async function newToken(userID, refreshToken) {
  if (await Token.findOne({ userID: userID, "tokens.tokenID": refreshToken })) {
    let user = await User.findByClient(userID);
    return tokenAuth.sign(userID, user, 60 * 60);
  } else {
    throw Error("Unauthorized access");
  }
}

module.exports = router;
