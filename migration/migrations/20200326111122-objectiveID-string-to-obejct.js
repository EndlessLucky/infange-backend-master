module.exports = {
  async up(db, client) {
    return await db
      .collection("meetings")
      .update(
        { "agendas.objectiveID": { $type: 2 } },
        { $set: { "agendas.$.objectiveID": [] } }
      );
  },

  async down(db, client) {
    return false;
  }
};
