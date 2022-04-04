const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const MFASeedScehma = new Schema({
    username: {
        type: String,
        required: true,
    },
    seed: {
        type: String,
        required: true,
    },
    owners: [
        {
            username: String,
            secureRecordId: String,
        },
    ],
});

module.exports = mongoose.model('Seed', MFASeedScehma);
