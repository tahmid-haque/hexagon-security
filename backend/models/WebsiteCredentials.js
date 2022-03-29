const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const WesbsiteScredentialsSchema = new Schema({
    username: {
        type: String,
        required: true
    },
    password: {
        type: String,
        required: true
    },
    UIDs: [{
            UID : String,
            secureRecordID : String
        }]
});

module.exports = mongoose.model('WebsiteCredentials', WesbsiteScredentialsSchema);