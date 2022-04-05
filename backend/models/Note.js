const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const NoteSchema = new Schema({
    title: {
        type: String,
        required: true,
    },
    note: {
        type: String,
        required: true,
    },
    lastModified: {
        type: Date,
        required: true,
        default: () => new Date(),
    },
    owners: [
        {
            username: String,
            secureRecordId: String,
        },
    ],
});

module.exports = mongoose.model('Note', NoteSchema);
