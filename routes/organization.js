var express = require("express");
var router = express.Router();
const mongoose = require("mongoose");
const Meetings = require("../db/meeting/meetings");
const ObjectId = mongoose.Types.ObjectId;
const Organization = require("../db/organization");

router.param("organizationID", async (req, res, next, orgID) => {
  if (!ObjectId.isValid(orgID)) {
    res.sendStatus(500).json({ message: "Invalid OrganizationID" });
  } else {
    if ((await Organizations.count({ _id: orgID })) > 0) {
      req.orgID = orgID;
      next();
    } else {
      res.sendStatus(404);
    }
  }
});

router.get("/", async (req, res, next) => {
  let organizations = [];
  req.user.map(async (x, i) => {
    const organizationDetails = await Organization.findOne(
      { _id: x.organizationID },
      { name: 1, tags: 1 }
    );
    organizations.push({
      id: x.organizationID,
      name: organizationDetails.name,
      tags: organizationDetails.tags
    });
    if (i === req.user.length - 1) return res.json(organizations);
  });
});

// router.get("/:organizationID", async (req, res, next) => {
//   try {
//     res.json(await Organizations.findOne({ _id: req.organizationID }));
//   } catch (err) {
//     console.log(err);
//     next(err);
//   }
// });

router.get("/:organizationID/locations", async (req, res, next) => {
  try {
    res.json(await Meetings.find().distinct("location"));
  } catch (err) {
    console.log(err);
    next(err);
  }
});

module.exports = router;
