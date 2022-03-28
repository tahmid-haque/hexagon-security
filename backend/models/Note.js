const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const NoteScehma = new Schema({
    title: {
        type: String,
        required: true
    },
    note: {
        type: String,
        required: true
    },
    lastModified: {
        type: Date, 
        default: new Date(),
        required: true
    },
    UIDs: [{
            UID : String,
            secureRecordID : String
        }]
});

module.exports = mongoose.model('Note', NoteScehma);