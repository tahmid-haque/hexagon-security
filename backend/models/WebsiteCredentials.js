const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const WesbsiteScredentialsSchema = new Schema({
    username: String,
    password: String,
    UIDs: String
});

module.exports = mongoose.model('WebsiteCredentials', WesbsiteScredentialsSchema);