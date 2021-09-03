var mongoose = require("mongoose");

var journalSchema = new mongoose.Schema(
    {
        JournalID: Number,
        JournalName: String,
        JournalAuthor: String
    });

var entrySchema = new mongoose.Schema(
    {
        EntryID: Number,
        JournalID: Number,
        EntryMessage: String,
        EntryAuthor: String,
        EntryDate: Date
    });

var journalEntity = mongoose.model("journal", journalSchema);
var entryEntity = mongoose.model("entry", entrySchema);

function connect() {
    mongoose.connect("mongodb+srv://test:test@journal.cf5tx.mongodb.net/myFirstDatabase?retryWrites=true&w=majority");
}


module.exports = {
    journalEntity: journalEntity,
    entryEntity: entryEntity,
    connect: connect
}