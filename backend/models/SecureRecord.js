const mongoose = require('mongoose');
const { extractDomain } = require('hexagon-shared/utils/parser');
const Schema = mongoose.Schema;
const sanitize = require('mongo-sanitize');

const SecureRecordSchema = new Schema({
    name: String,
    key: String,
    recordId: String,
    uid: String,
    type: {
        type: String,
        validate: [
            (type) => type === 'account' || type === 'seed' || type === 'note',
            'Please enter a valid type',
        ],
    },
});

SecureRecordSchema.pre('save', async function (next) {
    if (this.type !== 'note') this.name = extractDomain(this.name);
    next();
});

module.exports = mongoose.model('SecureRecord', SecureRecordSchema);
