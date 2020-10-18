var express = require("express");
var router = express.Router();
const mongoose = require("mongoose");
const agenda = require("./meetingAgenda");
const Meetings = require("../db/meeting/meetings");
const db = require("../db");
const Users = db.User;
const ObjectId = mongoose.Types.ObjectId;
const Objectives = require("../db/objective/objective");
const socketAPI = require("../socketAPI");
const cron = require("node-cron");
const Notification = require("../db/notification");
const Organization = require("../db/organization");

const timeouts = [];

cron.schedule("1 * * * * *", async function () {
  var endDate = new Date(new Date().getTime() + 15 * 60 * 1000);
  var startDate = new Date(new Date().getTime() + 14 * 60 * 1000);
  let allMeetings = await Meetings.find({
    startDate: { $gte: startDate, $lt: endDate },
  });

  allMeetings.forEach(async (meeting) => {
    Notification.trigger(
      "meeting_reminder",
      {
        title: `Meeting`,
        message: `Your meeting ${meeting.title} will start in 15 minutes`,
        id: meeting._id,
      },
      [
        ...meeting.invitees
          .filter((i) => i.requestStatus === "Accept")
          .map((i) => i.userID),
        meeting.ownerID,
      ]
    );
  });
});

router.param("meetingID", async (req, res, next, mID) => {
  if (!ObjectId.isValid(mID)) {
    res.status(404).json({ message: "Invalid meetingID" });
  } else {
    if ((await Meetings.count({ _id: mID })) > 0) {
      req.meetingID = mID;
      next();
    } else {
      res.sendStatus(404);
    }
  }
});

router.param("inviteeID", async (req, res, next, inviteeID) => {
  req.inviteeID = inviteeID;
  next();
});

router.param("memberId", async (req, res, next, memberId) => {
  req.memberId = memberId;
  next();
});

router.post("/", async (req, res, next) => {
  try {
    let mtng = new Meetings({
      ...req.body.meeting,
      ownerID: req.user.find(
        (x) => x.organizationID === req.body.meeting.organizationID
      )._id,
    });
    let objectives = [];
    if (req.body.oldMeetingId !== "") {
      let m1 = await Meetings.findOne({ _id: req.body.oldMeetingId });
      for (const value of m1.objectives) {
        let ob1 = await Objectives.findOne({ _id: value });
        if (ob1.status !== "Completed") {
          ob1.meetings.push(mtng._id);
          await ob1.save();
          objectives.push(value);
        }
      }
      mtng.oldMeetings = [
        ...(m1.oldMeetings || []),
        ObjectId(req.body.oldMeetingId),
      ];
    }
    mtng.objectives = objectives;

    Notification.trigger(
      "meeting_created",
      {
        title: `Meeting`,
        message: `You are invited to meeting ${mtng.title}`,
        id: mtng._id,
      },
      mtng.invitees.map((i) => i.userID)
    );

    res.json(
      await mtng
        .save()
        .then((t) =>
          t.populate({ path: "oldMeetings", model: Meetings }).execPopulate()
        )
    );
  } catch (err) {
    next(err);
  }
});

// router.post("/", async (req, res, next) => {
//   try {
//     let mtng = new Meetings({
//       ...req.body,
//       ownerID: req.user.find(x => x.organizationID === req.body.organizationID)
//         ._id
//     });

//     let objectives = [];
//     if (mtng.originalMeetingID) {
//       let m1 = await Meetings.findOne(
//         { originalMeetingID: mtng.originalMeetingID },
//         { createDate: -1 }
//       );
//       if (!m1) {
//         m1 = await Meetings.findOne({ _id: mtng.originalMeetingID });
//       }
//       for (const value of m1.objectives) {
//         let ob1 = await Objectives.findOne({ _id: value });
//         if (ob1.status !== "Completed") {
//           ob1.meetings.push(mtng._id);
//           await ob1.save();
//           objectives.push(value);
//         }
//       }
//     }
//     mtng.objectives = objectives;
//     await mtng.save();
//     res.json(mtng);
//   } catch (err) {
//     next(err);
//   }
// });

router.get("/", async (req, res, next) => {
  try {
    let sort = 0,
      skip = 0,
      limit = 0,
      startDate = 0,
      findQuery = {};
    if (req.query.pageNo) {
      skip = req.query.pageNo * 3;
      limit = (req.query.pageNo + 1) * 3 + 1;
      sort = 1;
      startDate = new Date();
      findQuery = {
        $or: [
          {
            ownerID: req.user[0]._id,
          },
          {
            "invitees.userID": req.user[0]._id,
          },
        ],
      };
    }
    findQuery["organizationID"] = { $in: req.organizations };
    findQuery["startDate"] = { $gte: startDate };
    const mtngs = await Meetings.find(findQuery)
      .populate({ path: "oldMeetings", model: Meetings })
      .skip(skip)
      .limit(limit)
      .sort({ startDate: sort });
    if (!req.query.pageNo) return res.json(mtngs);
    let hasmore = false;
    if (mtngs.length > (req.query.pageNo + 1) * 3) {
      hasmore = true;
      mtngs.pop();
    }
    return res.json({ mtngs, hasmore });
  } catch (err) {
    next(err);
  }
});

router.get("/:meetingID", async (req, res, next) => {
  try {
    res.json(
      await Meetings.findOne({ _id: req.meetingID }).populate({
        path: "oldMeetings",
        model: Meetings,
      })
    );
  } catch (err) {
    next(err);
  }
});

router.put("/:meetingID", async (req, res, next) => {
  try {
    if (req.body.status === "Ended") {
      const durationInMilliSec =
        new Date().getTime() - new Date(req.body.startDate).getTime();
      req.body.duration = `${durationInMilliSec / 1000}`;
    }
    let m = await Meetings.findOneAndUpdate(
      {
        _id: req.meetingID,
        organizationID: { $in: req.user.map((x) => x.organizationID) },
        // We need to add more complex filtering so only the owner or invitees can edit this
        // also we may need to break this put apart to enforce different restrictions on different updates
        // breaking this up will likely solve the duplicate invitee as well
      },
      req.body
    );

    Notification.trigger("update_data", { title: `UpdateDate`, id: m._id }, [
      m.ownerID,
      ...m.invitees.map((i) => i.userID),
    ]);

    timeouts.forEach((t) => {
      clearTimeout(t);
    });

    if (req.body.status === "Ended" && m.status !== "Ended") {
      const updatorUserName = req.user[0].firstName;
      const updatorUserId = req.user[0]._id;

      Notification.trigger(
        "meeting_end_confirmation",
        {
          title: `MeetingEndConfirmation`,
          message: `${updatorUserName} ended this meeting. Do you agree?`,
          updatorUserId: updatorUserId,
          id: req.meetingID,
        },
        [req.meetingID]
      );
      const newMeeting = await Meetings.findById(req.meetingID);
      newMeeting.invitees.forEach((i) => {
        i.isMeetingEndAgreed = null;
      });
      newMeeting.meetingEndRequester = req.user[0]._id;
      newMeeting.save();
    }

    m ? res.sendStatus(200) : res.sendStatus(404);
  } catch (err) {
    next(err);
  }
});

router.patch("/:meetingID/tags", async (req, res, next) => {
  try {
    const mtng = await Meetings.findOneAndUpdate(
      { _id: req.params.meetingID },
      { $set: { tags: req.body.tags } },
      { new: true }
    );
    if (req.body.newTag) {
      await Organization.findOneAndUpdate(
        { _id: req.user[0].organizationID },
        { $addToSet: { tags: req.body.newTag } }
      );
    }
    res.json(mtng);
  } catch (err) {
    next(err);
  }
});

router.post("/:meetingID/invitees", async (req, res, next) => {
  try {
    let m = await Meetings.findOne({
      _id: req.meetingID,
      organizationID: { $in: req.user.map((x) => x.organizationID) },
    });

    const inviterName = req.user[0].firstName;

    Notification.trigger(
      "meeting_created",
      {
        title: `Meeting`,
        message: `${inviterName} invited you to meeting ${m.title}`,
        id: m._id,
      },
      req.body.map((i) => i.userID)
    );

    m.addInvitees(req.body);
    m.save();
    res.json(m.invitees);
  } catch (err) {
    console.log(err);
    next(err);
  }
});

router.delete("/:meetingID/invitees/:inviteeID", async (req, res, next) => {
  try {
    await Meetings.removeInvitee(req.meetingID, req.inviteeID);

    Notification.trigger(
      "meeting_invite_removed",
      {
        title: `MeetingRemoved`,
        message: `You are removed from meeting`,
        id: req.meetingID,
      },
      [req.inviteeID]
    );

    res.sendStatus(200);
  } catch (err) {
    res.sendStatus(404);
  }
});

router.patch("/:meetingID/invitees/:inviteeID", async (req, res, next) => {
  try {
    let m = await Meetings.findOne({
      _id: req.meetingID,
    });
    let user = await Users.findOne({
      _id: req.inviteeID,
    });
    m.invitees.find((i) => i.userID == req.inviteeID).requestStatus =
      req.body.requestStatus;
    m.save((err, obj) => {
      Notification.trigger(
        "update_data",
        { title: `UpdateDate`, id: obj._id },
        [obj.ownerID, ...obj.invitees.map((i) => i.userID)]
      );

      Notification.trigger(
        "meeting_invite_accepted",
        {
          title: `Meeting`,
          message: `${user.firstName} has ${
            req.body.requestStatus === "Accept" ? `accepted` : `declined`
          } ${m.title} meeting invite`,
          id: obj._id,
        },
        [obj.ownerID]
      );
      res.json(obj);
    });
  } catch (err) {
    res.sendStatus(404);
  }
});

router.put(
  "/:meetingID/members/:memberId/isMeetingEndAgreed",
  async (req, res, next) => {
    try {
      let m = await Meetings.findOne({
        _id: req.meetingID,
      });
      m.invitees.find((i) => i.userID == req.memberId).isMeetingEndAgreed =
        req.body.isAgreed;

      if (!req.body.isAgreed) m.status = "InProgress";

      Notification.trigger(
        "meeting_end_agreed",
        { title: `meeting_end_agreed`, id: m._id },
        [req.meetingID]
      );

      m.save();
      res.status(200).json(m);
    } catch (err) {
      console.log(err);
      res.sendStatus(404);
    }
  }
);

// only allow the owner to delete meetings
router.delete("/:meetingID", async (req, res, next) => {
  try {
    let m = await Meetings.deleteOne({
      _id: req.meetingID,
      ownerID: req.user[0]._id,
    });
    m.n > 0 ? res.sendStatus(200) : res.sendStatus(404);
  } catch (err) {
    next(err);
  }
});

router.use("/:meetingID/agendas", agenda);

module.exports = router;
