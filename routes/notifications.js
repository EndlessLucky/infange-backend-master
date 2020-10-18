var express = require("express");
var router = express.Router();
const mongoose = require("mongoose");
const Notification = require("../db/notification");
const Subscribers = require("../db/subscribers");

router.post("/subscribe", async (req, res) => {
  await Subscribers.findOneAndUpdate(
    { userId: req.body.userId },
    { ...req.body.subscription, userId: req.body.userId },
    {
      new: true,
      upsert: true, // Make this update into an upsert
    }
  );
  res.status(200).json({ success: true });
});

router.get("/user/:userId", async (req, res) => {
  let notifications = await Notification.find({
    recipientId: req.params.userId,
  }).sort({ trash: 1, createDate: -1 });
  res.json({ notifications });
});

router.patch("/:notificationId/read", async (req, res) => {
  await Notification.updateOne(
    {
      _id: req.params.notificationId,
    },
    { read: true }
  );

  res.json({ message: "success" });
});

router.delete("/:notificationId", async (req, res) => {
  await Notification.updateOne(
    {
      _id: req.params.notificationId,
    },
    { trash: true, read: true }
  );

  res.json({ message: "success" });
});

module.exports = router;
