const nodemailer = require("nodemailer");
const db = require("./db");
const Users = db.User;

// var client = nodemailer.createTransport(sgTransport(options));
var client = nodemailer.createTransport({
  host: "npadc1.netpayadvance.local", // hostname
  //auth: { user: "no-reply@Infange.com", pass: "Netpay1107" },
  secureConnection: false, // TLS requires secureConnection to be false
  port: 25, // port for secure SMTP,
  tls: {
    rejectUnauthorized: false,
  },
});

const send = async (payload, recipients, eventName = null, link = null) => {
  let emailIds;
  let users;
  let message = payload.message;
  if (eventName === "Verify" || eventName === "reset_password") {
    emailIds = recipients;
  } else {
    users = await Users.find({ _id: { $in: recipients } });
    emailIds = users
      .map((user) => {
        const userEmail = user.contact.find(
          (contact) => contact.type === "email"
        );
        if (userEmail) return userEmail.info;
      })
      .filter((email) => !!email);
  }

  if (link)
    message = message.concat(
      `. Click here to navigate to <a href="${link}">page</a>`
    );

  return client
    .sendMail({
      from: "no-reply@Infange.com",
      to: emailIds.join(","),
      subject: "New notification from Infange",
      text: message,
      html: `<p> ${message}</p>`,
    })
    .then((msg) => console.log("Mail Sent"))
    .catch((err) => console.log("erree", err));
};

module.exports = { send };
