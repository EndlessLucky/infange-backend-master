module.exports = {
  async up(db, client) {
    const Meetings = await db
      .collection("meetings")
      .find({ "invitees.userName": null })
      .forEach(async meeting => {
        let UpdatedMeeting = meeting;
        await meeting.invitees.forEach(async (invitee, i) => {
          if (invitee.userName) return invitee;
          const User = await db
            .collection("users")
            .findOne({ _id: invitee.userID }, { firstName: 1, lastName: 1 });
          invitee["userName"] = User.firstName + " " + User.lastName;
          UpdatedMeeting.invitees[i] = invitee;
          if (UpdatedMeeting.invitees.length === i + 1) {
            db.collection("meetings").save(UpdatedMeeting);
          }
          return invitee;
        });
      });
    return Meetings;
  },

  async down(db, client) {
    return false;
  }
};
