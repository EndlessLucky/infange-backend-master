const webpush = require("web-push");
const Subscribers = require("./db/subscribers");

// const publicKey =
//   "BPAsCrULaue3t97f7sXKOXyr0lFN18_yd-AnN-d8u5ua-DjimumBwrSf38BL2x-kVbg9RgvjI-GnejXHQY8ejM0";
// const privateKey = "v-7uzeNZBMMu9mOeQQNFgXS9bbs8bz5T3HGQekSSTsk";

const send = async (payload, recipients) => {
  const subscriptions = await Subscribers.find({ userId: { $in: recipients } });
  subscriptions.forEach(subscription => {
    webpush.sendNotification(subscription.toObject(), JSON.stringify(payload));
  });
};

module.exports = { send };
