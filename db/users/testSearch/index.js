const mongoose = require("mongoose");
const Schema = mongoose.Schema;
conn = mongoose.createConnection("mongodb://admin:SnY4h3ZtHDyXuBy9@NPA35", {
  dbName: "testSearch",
  autoReconnect: "true"
});

const TestSearch = new Schema({
  line_id: {
    type: Number,
    required: true
  },
  play_name: {
    type: String,
    required: true
  },
  speech_number: {
    type: Number,
    required: true
  },
  line_number: {
    type: String,
    required: true
  },
  speaker: {
    type: String,
    required: true
  },
  text_entry: {
    type: String,
    required: true
  }
});

module.exports = conn.model("shakespeare", TestSearch, "shakespeare");
