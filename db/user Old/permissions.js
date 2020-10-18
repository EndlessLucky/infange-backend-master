
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const Permissions = new Schema({
    viewingProfiles: {
        type: String,
        required: true
    },
    goals: {
        type: String,
        required: true
    },
    milestones: {
        type: String,
        required: true
    },
    tasks: {
        type: String,
        required: true
    }
})

module.exports = Permissions