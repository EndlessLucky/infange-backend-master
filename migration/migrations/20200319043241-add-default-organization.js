const { ObjectId } = require("mongodb");
module.exports = {
  async up(db, client) {
    return db.collection("organizations").insert({
      _id: ObjectId("5b2a63078f565c741c141482"),
      name: "NetpayAdvance",
      ownerID: ObjectId("5d9b63914b89c12a6cf4fdda")
    });
    // TODO write your migration here.
    // See https://github.com/seppevs/migrate-mongo/#creating-a-new-migration-script
    // Example:
    // await db.collection('albums').updateOne({artist: 'The Beatles'}, {$set: {blacklisted: true}});
  },

  async down(db, client) {
    return db
      .collection("organizations")
      .deleteOne({ _id: ObjectId("5b2a63078f565c741c141482") });
    // TODO write the statements to rollback your migration (if possible)
    // Example:
    // await db.collection('albums').updateOne({artist: 'The Beatles'}, {$set: {blacklisted: false}});
  }
};
