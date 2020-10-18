var express = require("express");
var router = express.Router();
const mongoose = require("mongoose");
const ObjectId = mongoose.Types.ObjectId;
const Notification = require("../db/notification");
const Meetings = require("../db/meeting/meetings");

router.param("agendaID", async (req, res, next, aID) => {
  let mtng = await getMeeting(req.meetingID);
  if (!mtng || !mtng.agendas.find(x => x._id.toString() === aID)) {
    res.sendStatus(404);
  } else {
    req.meeting = mtng;
    req.agendaID = aID.toString();
    next();
  }
});

const getMeeting = async meetingID => {
  return await Meetings.findById(meetingID);
};

router.get("/", async (req, res, next) => {
  try {
    let mtng = await getMeeting(req.meetingID);
    res.json(mtng.agendas);
  } catch (err) {
    console.log(err);
    next(err);
  }
});

router.post("/", async (req, res, next) => {
  try {
    let mtng = await getMeeting(req.meetingID);
    let owner = req.user.find(
      x => x.organizationID === mtng.organizationID.toString()
    );
    const createnewAgenda = mtng.agendas.create({
      ...req.body,
      ownerID: owner._id
    });
    mtng.agendas.push(createnewAgenda);

    Notification.trigger("update_data", { title: `UpdateDate`, id: mtng._id }, [
      mtng.ownerID,
      ...mtng.invitees.map(i => i.userID)
    ]);

    await mtng.save();
    res.json(createnewAgenda);
  } catch (err) {
    console.log(err);
    next(err);
  }
});

router.patch("/:agendaID", async (req, res, next) => {
  try {
    let mtng = req.meeting;
    let owner = req.user.find(
      x => x.organizationID === mtng.organizationID.toString()
    );
    let idx = mtng.agendas.findIndex(x => x._id.toString() === req.agendaID);
    if (idx < 0) {
      res.sendStatus(404);
    } else if (
      owner._id.toString() !== mtng.agendas[idx].ownerID.toString() &&
      req.body.indent === undefined
    ) {
      res.sendStatus(401);
    } else {
      mtng.agendas[idx] = { ...mtng.agendas[idx].toObject(), ...req.body };

      await mtng.save();

      Notification.trigger(
        "update_data",
        { title: `UpdateDate`, id: mtng._id },
        [mtng.ownerID, ...mtng.invitees.map(i => i.userID)]
      );

      res.json(mtng);
      // res.sendStatus(201);
    }
  } catch (err) {
    console.log(err);
    next(err);
  }
});

router.delete("/:agendaID", async (req, res, next) => {
  try {
    let mtng = req.meeting;
    const newAgendas = mtng.agendas.filter(
      x => x._id.toString() !== req.agendaID
    );
    mtng.agendas = newAgendas;

    try {
      await mtng.save();
    } catch (e) {
      console.log(e);
    }

    Notification.trigger("update_data", { title: `UpdateDate`, id: mtng._id }, [
      mtng.ownerID,
      ...mtng.invitees.map(i => i.userID)
    ]);

    res.json(mtng);
  } catch (err) {
    console.log(err);
    next(err);
  }
});

module.exports = router;
