var express = require("express");
var router = express.Router();
const mongoose = require("mongoose");
const Documents = require("../db/meeting/documents");
const ObjectId = mongoose.Types.ObjectId;

router.param("documentid", async (req, res, next, docID) => {
  if (!ObjectId.isValid(docID)) {
    res.status(500).json({ message: "Invalid documentID" });
  } else {
    if ((await Documents.count({ _id: docID })) > 0) {
      req.docID = docID;
      next();
    } else {
      res.sendStatus(404);
    }
  }
});

router.post("/", async (req, res, next) => {
  try {
    let doc = new Documents(req.body);
    await doc.save();
    res.json(doc);
  } catch (err) {
    next(err);
  }
});

router.get("/", async (req, res, next) => {
  try {
    res.json(await Documents.find({ userID: req.userID }));
  } catch (err) {
    next(err);
  }
});


router.get("/:documentid", async (req, res, next) => {
  try {
    let doc = await Documents.findOne({ _id: req.docID });
    doc ? res.json(doc) : res.sendStatus(404);
  } catch (err) {
    next(err);
  }
});

router.patch("/:documentid", async (req, res, next) => {
  try {
    let m = await Documents.updateOne(
      {
        _id: req.docID
      },
      { ...req.body }
    );
    m.n > 0 ? res.sendStatus(200) : res.sendStatus(404);
  } catch (err) {
    next(err);
  }
});

router.delete("/:documentid", async (req, res, next) => {
  try {
    let m = await Documents.deleteOne({ _id: req.docID });
    m.n > 0 ? res.sendStatus(200) : res.sendStatus(404);
  } catch (err) {
    next(err);
  }
});

module.exports = router;
