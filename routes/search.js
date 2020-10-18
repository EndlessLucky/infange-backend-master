var express = require("express");
var router = express.Router();
const Search = require("../db/users/search");

router.get("/", async (req, res, next) => {
  try {
    const profile = req.user;
    let data = [];
    if (req.query.objectives === "true") {
      data.push(Search.Objectives.textSearch(profile, req.query.search));
    }
    if (req.query.meetings === "true") {
      data.push(Search.Meetings.textSearch(profile, req.query.search));
    }
    if (req.query.notes === "true") {
      data.push(Search.Notes.textSearch(profile, req.query.search));
    }
    if (req.query.users === "true") {
      data.push(Search.Users.textSearch(profile, req.query.search));
    }
    //req.users
    let results = await Promise.all(data);
    results = results
      .reduce((p, c) => [...p, ...c])
      .sort((a, b) => b.score - a.score);

    res.json(results);
  } catch (err) {
    next(err);
  }
});

module.exports = router;
