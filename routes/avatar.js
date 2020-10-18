const multer = require("multer");
const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
const gridfs = require("gridfs-stream");
const sharp = require("sharp");
gridfs.mongo = mongoose.mongo;
const connection = mongoose.connection;
const storage = multer.memoryStorage();
const upload = multer({ storage });
let Duplex = require("stream").Duplex;
function bufferToStream(buffer) {
  let stream = new Duplex();
  stream.push(buffer);
  stream.push(null);
  return stream;
}

connection.once("open", function () {
  const gfs = gridfs(connection.db);
  console.log("MongoDB connection opened!");
  gfs.collection("avatar");

  router.param("userID", async (req, res, next, userID) => {
    let files = await gfs.files
      .find({
        "metadata.userID": req.params.userID,
      })
      .toArray();
    const file = files[files.length - 1];

    if (file) {
      if (
        req.headers["if-none-match"] &&
        req.headers["if-none-match"] === file.md5
      ) {
        res.sendStatus(304);
      } else {
        res.set("ETag", file.md5);
        req.file = file;
        next();
      }
    } else {
      res.sendStatus(404);
    }
  });

  router.post("/", upload.single("file"), async (req, res, next) => {
    const file = req.file; // file passed from client
    try {
      let r = await sharp(file.buffer)
        //  .resize(40, 40)
        .png()
        .toBuffer();
      let user = req.user.find(
        (x) => x.organizationID === req.organizations[0]
      ); //await User.findByClient(req.organizationID, req.token.sub);

      let writestream = gfs.createWriteStream({
        filename: `${req.organizations[0]}-avatar.png`,
        metadata: {
          userID: user._id.toString(),
          organizationID: req.organizations[0],
        },
        content_type: "image/png",
        root: "avatar",
      });

      // find old avatars
      let e = await gfs.files
        .find({
          metadata: {
            userID: user._id,
            organizationID: req.organizations[0],
          },
        })
        .toArray();

      // delete old avatars
      //e.map(async x => await gfs.remove({_id: x._id, root: 'avatar'}));
      bufferToStream(r).pipe(writestream);
    } catch (err) {
      console.warn(err);
    }
    res.sendStatus(200);
  });

  router.get("/", async (req, res, next) => {
    gfs
      .createReadStream({ filename: `${req.organizationID}-avatar.png` })
      .pipe(res);
  });

  router.get("/:userID", async (req, res, next) => {
    res.contentType("image/png");
    gfs.createReadStream({ _id: req.file._id }).pipe(res);
  });
});

module.exports = router;
