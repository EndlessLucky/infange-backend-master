var mongoose = require("mongoose");

module.exports = {
  async up(db, client) {
    try {
      await db
        .collection("objectives")
        .find()
        .forEach(async (obj) => {
          const agendaID = obj.agenda && Object.keys(obj.agenda)[0];
          if (agendaID) {
            const queryKey = `agendas.objectiveID.${obj._id}`;
            let query = {};
            query[queryKey] = { $exists: false };
            query["agendas._id"] = mongoose.Types.ObjectId(agendaID);
            let objLink = {};
            objLink[`${obj._id}`] = obj.description;
            try {
              await db
                .collection("meetings")
                .findOneAndUpdate(
                  query,
                  { $push: { "agendas.$.objectiveID": objLink } },
                  { $new: true }
                );
            } catch (err) {
              console.log("err", err);
            }
          }
        });
      return;
    } catch (err) {
      console.log("err", err);
    }
  },

  async down(db, client) {
    return false;
  },
};
