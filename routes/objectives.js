var express = require("express");
var router = express.Router();
const mongoose = require("mongoose");
const Objectives = require("../db/objective/objective");
const ObjectId = mongoose.Types.ObjectId;
const Meetings = require("../db/meeting/meetings");
const Organization = require("../db/organization");
const Notification = require("../db/notification");
const schedule = require("node-schedule");
const Reminder = require("../db/objective/reminder");
const moment = require("moment");

router.param("objectiveid", async (req, res, next, objID) => {
  if (!ObjectId.isValid(objID)) {
    res.status(500).json({ message: "Invalid objectiveID" });
  } else {
    let obj = await Objectives.findOne({ _id: objID });
    console.log(obj.ownerID.toString(), req.userID, obj.assigneeID.toString());
    if (
      obj &&
      !req.user.find(
        (x) =>
          x._id === obj.ownerID.toString() ||
          x._id === obj.assigneeID.toString()
      ) &&
      (req.method === "PUT" || req.method === "DELETE")
    ) {
      res.status(403).json({ message: "You are not authorized to edit this" });
    } else if (obj) {
      req.objID = objID;
      next();
    } else {
      res.sendStatus(404);
    }
  }
});

const getMeeting = async (meetingID) => {
  return await Meetings.findById(meetingID);
};

router.post("/", async (req, res, next) => {
  try {
    let obj = new Objectives({
      ...req.body,
      ownerID: req.user.find(
        (x) => x.organizationID === req.body.organizationID
      )._id,
    });
    if (req.body.meetingID) {
      let mtng = await Meetings.findOneAndUpdate(
        { _id: req.body.meetingID },
        {
          $push: {
            objectives: obj,
          },
        }
      );
      obj.meetings.push(mtng._id);
    }

    const newObjective = await obj.save();

    Notification.trigger(
      "objective_updated",
      {
        title: `Objective`,
        message: `An objective "${
          newObjective.description
        }" with due date ${moment(newObjective.dueDate).format(
          "Do MMMM YYYY"
        )} has been assigned to you`,
        id: newObjective._id,
      },
      [req.body.assigneeID]
    );

    res.json(obj);
  } catch (err) {
    console.log(err);
    next(err);
  }
});

router.get("/", async (req, res, next) => {
  try {
    let skip = 0,
      limit = 0,
      sort = 0,
      userID = true,
      status = ["Completed", "Pending", "InProgress"];
    let findQuery = {
      organizationID: { $in: req.organizations },
      status: { $in: status },
    };
    if (req.query.pageNo) {
      skip = req.query.pageNo * 5;
      limit = (req.query.pageNo + 1) * 5;
      sort = 1;
      userID = req.user[0]._id;
      // status = status.splice(0, 1);
      findQuery.status = "Pending";
      findQuery.assigneeID = userID;
    }
    const objs = await Objectives.find(findQuery)
      .skip(skip)
      .limit(limit)
      .sort({ dueDate: sort });
    return res.json(objs);
  } catch (err) {
    next(err);
  }
});

router.get("/:objectiveid", async (req, res, next) => {
  try {
    let obj = await Objectives.findOne({
      ownerID: req.userID,
      meetingID: req.meetingID,
      _id: req.objID,
    });
    obj ? res.json(obj) : res.sendStatus(404);
  } catch (err) {
    next(err);
  }
});

router.put("/:objectiveid", async (req, res, next) => {
  try {
    let m = await Objectives.findOneAndUpdate(
      {
        _id: req.objID,
        meetingID: req.meetingID,
      },
      req.body
    ).then(async (obj) => {
      if (obj.agenda) {
        const objective = {};
        objective[req.objID] = req.body.description;
        await Meetings.findOneAndUpdate(
          { "agendas._id": Object.keys(obj.agenda)[0] },
          { $set: { "agendas.$.objectiveID": objective } }
        );
      }
      return obj;
    });
    const userId = req.user[0]._id;
    const ownerID = req.body.ownerID;
    const assigneeID = req.body.assigneeID;

    let messageRecipient;

    if (userId === ownerID) {
      messageRecipient = assigneeID;
    } else {
      messageRecipient = ownerID;
    }
    if (req.body.reminder) {
      let targetTime = new Date(req.body.dueDate);
      targetTime.setDate(targetTime.getDate() - req.body.days);

      const removeOldReminder = await Reminder.findOneAndUpdate(
        { objID: req.body.objID },
        {
          $set: {
            isRemoved: true,
          },
        }
      );

      const newReminder = new Reminder({
        description: req.body.description,
        dueDate: req.body.dueDate,
        objID: req.body._id,
        assigneeID: req.body.assigneeID,
        targetTime,
      });
      const job = await newReminder.save();

      const s = schedule.scheduleJob(
        targetTime,
        async function (params) {
          const R = params.Reminder;
          const data = await R.findOne({
            objID: params.objID,
            isRemoved: false,
          });
          if (data)
            Notification.trigger(
              "objective_reminder",
              {
                title: `Objective`,
                message: `Your objective ${data.description} will be due on ${data.dueDate}.`,
                id: data.objID,
              },
              [data.assigneeID]
            );
        }.bind(null, { Reminder, objID: req.body._id })
      );
    }

    Notification.trigger(
      "objective_updated",
      {
        title: `Objective`,
        message: `Your objective ${m.description} is updated or changed status.`,
        id: req.objID,
      },
      [messageRecipient]
    );
    m ? res.sendStatus(200) : res.sendStatus(404);
  } catch (err) {
    next(err);
  }
});

router.patch("/:objectiveID", async (req, res, next) => {
  try {
    const obj = await Objectives.findOneAndUpdate(
      { _id: req.params.objectiveID },
      {
        $set: {
          status: req.body.status,
        },
      },
      { new: true }
    )
      .then(async (resp) => {
        const newObjs = await Objectives.find({
          organizationID: { $in: req.organizations },
          status: "Pending",
          assigneeID: req.user[0]._id,
        })
          .skip(req.query.pageNo * 5)
          .limit((req.query.pageNo + 1) * 5)
          .sort({ dueDate: 1 });
        return res.json(newObjs);
      })
      .catch((err) => {
        next(err);
      });
  } catch (err) {
    next(err);
  }
});

router.patch("/:objectiveID/tags", async (req, res, next) => {
  try {
    console.log("req.body", req.body.tags);
    const obj = await Objectives.findOneAndUpdate(
      { _id: req.params.objectiveID },
      { $set: { tags: req.body.tags } },
      { new: true }
    );
    if (req.body.newTag) {
      const resp = await Organization.findOneAndUpdate(
        { _id: req.user[0].organizationID },
        { $addToSet: { tags: req.body.newTag } }
      );
    }
    // console.log("mtng",resp,req.user);
    res.json(obj);
  } catch (err) {
    next(err);
  }
});

router.delete("/:objectiveid", async (req, res, next) => {
  try {
    let query = {};
    query[`${req.objID}`] = { $exists: true };
    let m = await Objectives.findOneAndDelete({
      _id: req.objID,
    }).then(async (obj) => {
      if (obj.agenda) {
        await Meetings.update(
          { "agendas._id": Object.keys(obj.agenda)[0] },
          { $pull: { "agendas.$.objectiveID": query } }
        );
      }
      return obj;
    });
    m ? res.sendStatus(200) : res.sendStatus(404);

    Notification.trigger(
      "objective_deleted",
      {
        title: `ObjectiveDeleted`,
        message: `Your objective ${m.description} is deleted.`,
        id: req.objID,
      },
      [m.assigneeID]
    );
  } catch (err) {
    next(err);
  }
});

module.exports = router;
