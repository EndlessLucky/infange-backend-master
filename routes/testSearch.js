var express = require("express");
var router = express.Router();
const mongoose = require("mongoose");
const TestSearches = require("../db/users/testSearch");
const ObjectId = mongoose.Types.ObjectId;

router.param("testSearchid", async (req, res, next, tsID) => {
  if (!ObjectId.isValid(tsID)) {
    res.status(500).json({ message: "Invalid testSearchID" });
  } else {
    if ((await TestSearches.count({ _id: tsID })) > 0) {
      req.tsID = tsID;
      next();
    } else {
      res.sendStatus(404);
    }
  }
});

router.get("/", async (req, res, next) => {
  try {
    res.json(
      await TestSearches.find(
        { $text: { $search: req.query.speaker } },
        { score: { $meta: "textScore" } },
        { limit: 10, sort: { score: { $meta: "textScore" } } }
      )
    );
  } catch (err) {
    next(err);
  }
});

module.exports = router;
