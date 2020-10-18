const bcrypt = require("bcrypt");
const SALT = 10;
const db = require("../db");
const User = db.Client;
const Token = db.Token;
const jwt = require("jsonwebtoken");

const config = {
  SECRET: process.env.SECRET
};

async function login(username, pass) {
  let user = await User.findOne({ username: username });
  console.log("User?", user);
  if (user) {
    if (await compare(pass, user.password)) {
      return user;
    }
  } else {
    throw Error("Invalid Username or Password");
  }
}

function encrypt(pass) {
  return new Promise((res, rej) => {
    bcrypt.hash(pass, SALT, (err, hash) => {
      if (err) {
        return rej(err);
      } else {
        return res(hash);
      }
    });
  });
}

function compare(plain, hash) {
  return new Promise((res, rej) => {
    bcrypt.compare(plain, hash, (err, match) => {
      return err == null ? res(match) : rej(err);
    });
  });
}

function sign(exp, clientID, data = "") {
  return new Promise((res, rej) => {
    jwt.sign(
      {
        exp: Math.floor(Date.now() / 1000) + exp,
        data: data,
        sub: clientID
      },
      config.SECRET,
      (err, token) => {
        if (err) {
          return rej(err);
        }
        return res(token);
      }
    );
  });
}

async function newUser(username, pass) {
  if (pass.length < 6 || pass.length > 32) {
    throw Error("Password must be between 6 and 32 characters");
  } else {
    let password = await encrypt(pass);
    return new User({ user: username, password: password }).save();
  }
}

async function newToken(userID, refreshToken) {
  if (
    await Token.findOne({ userID: userID, "tokens.0.tokenID": refreshToken })
  ) {
    let user = await User.findById(userID);
    return sign(60 * 60, userID, user);
  } else {
    throw Error("Unauthorized access");
  }
}

async function verify(token, options = {}) {
  return new Promise((resolve, reject) => {
    jwt.verify(token, config.SECRET, options, (err, decoded) => {
      if (err) return reject(err);
      else return resolve(decoded);
    });
  });
}

module.exports = {
  login,
  newUser,
  encrypt,
  compare,
  newToken,
  verify,
  sign: (userID, user) => sign(60 * 60, userID, user)
};
