var express = require("express");
var router = express.Router();
const multer = require("multer");
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
  gfs.collection("Attachment");

  router.param("imageName", async (req, res, next) => {
    let file = await gfs.files.findOne({
      filename: req.params.imageName,
    });
    if (file) {
      req.file = file;
      next();
    } else {
      res.sendStatus(404);
    }
  });

  router.get("/:imageName", async (req, res, next) => {
    // res.contentType("image/png");
    const file = await gfs.createReadStream({ _id: req.file._id });
    file.pipe(res);
  });

  router.post("/", upload.any(), async (req, res, next) => {
    const file = req.files[0]; // file passed from client
    try {
      let r;
      if (file.mimetype.indexOf("image/") === 0)
        r = await sharp(file.buffer).toBuffer();
      let writestream = await gfs.createWriteStream({
        filename: `${file.originalname}`,
        content_type: file.mimetype,
        root: "Attachment",
      });
      //   new Promise ( (resolve, reject)=>{
      bufferToStream(r || file.buffer).pipe(writestream);
      //   }).then()
      writestream.on("error", (err) => {
        return res.status(400).json({ msg: err });
      });
      writestream.on("close", () => {
        return res.json({
          uploaded: true,
          url:
            (process.env.GET_IMAGE_URL || "http://localhost:9003/api/upload/") +
            `${file.originalname}`,
        });
      });
    } catch (err) {
      return res.status(400).json({ msg: err });
    }
    // return res.json(
    //     {
    //         "uploaded": true,
    //         "url": process.env.GET_IMAGE_URL || `http://localhost:9003/api/upload/${file.originalname}`
    //     }
    // )
  });
});

module.exports = router;
