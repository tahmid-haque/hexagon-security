const mongoose = require('mongoose');
const Schema = mongoose.Schema;


/**
 * Schema for MFA Seed records which contains 
 * a username, seed, list of owners for this record
 */
const MFASeedSchema = new Schema({
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

module.exports = mongoose.model('Seed', MFASeedSchema);
