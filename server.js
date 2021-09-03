var database = require("./database");
var datetime = require("./datetime");
var error = require("./error");
var express = require("express");
var bodyParser = require("body-parser");
const { GENERAL_ERROR_MESSAGE } = require("./error");

var app = express();

var urlEncodedParser = bodyParser.urlencoded({ extended: false });

app.set("view engine", "ejs");

// ====================================================================================================
// HOME PAGES 
// ====================================================================================================

// both "/" and "/home" have the same mapping
app.get("/", function (req, res) {
    res.render("home", {});
});

app.get("/home", function (req, res) {
    res.render("home", {});
});


// ====================================================================================================
// READING JOURNALS 
// ====================================================================================================

// getting the list of journals
app.get("/journals", function (req, res) {
    // retrieves journals from database
    database.journalEntity.find({}, function (err, journals) {
        if (err) {
            throw err;
            res.render("error", { errorMsg: error.DATABASE_ERROR_MESSAGE });
        }
        res.render("journals", { journals: journals });
    });
});

// getting the selected journal to read its entries
app.get("/get-journal/:ID", function (req, res) {
    // retrieves journal by specific ID
    database.journalEntity.findOne({}, function (err, journal) {
        if (err) {
            throw err;
            res.render("error", { errorMsg: error.DATABASE_ERROR_MESSAGE });
        }
        // if there are no journals, send error page
        if (!journal) {
            res.render("error", { errorMsg: error.NULL_JOURNAL_ERROR_MESSAGE });
            return;
        }
        // if it gets the journal, it then gets all the entries for that journal
        database.entryEntity.find({}, function (err2, entries) {
            if (err2) {
                throw err2;
                res.render("error", { errorMsg: error.DATABASE_ERROR_MESSAGE });
            }
            // sorts the entries by date (newest to oldest)
            entries.sort((e1, e2) => (e1.EntryDate < e2.EntryDate) ? 1 : -1);

            // reformats dates into strings that are easier to understand
            var entryDates = [];
            entries.forEach(entry => {
                entryDates.push(datetime.formatDate(entry.EntryDate));
            });

            res.render("journal", { journal: journal, entries: entries, entryDates: entryDates });
        }).where("JournalID").equals(Number(req.params.ID));
    }).where("JournalID").equals(Number(req.params.ID));
});


// ====================================================================================================
// CREATING JOURNALS 
// ====================================================================================================

// page to enter the details of the new journal
app.get("/create-journal", function (req, res) {
    res.render("newJournal", { input: req.query });
});

// creating the journal and committing it to the database, going to a success page
app.post("/create-journal", urlEncodedParser, function (req, res) {
    // gets all journals to find the number in the database
    database.journalEntity.find({}, function (err, journals) {
        if (err) {
            throw err;
            res.render("error", { errorMsg: error.DATABASE_ERROR_MESSAGE });
        }
        // adds the new journal to the database
        // the ID of the journal is based on how many were counted beforehand
        // the name and author of the journal are taken from the user inputs in the form
        database.journalEntity({ JournalID: journals.length, JournalName: req.body.name, JournalAuthor: req.body.author }).save(function (err) {
            if (err) {
                throw err;
                res.render("error", { errorMsg: error.DATABASE_ERROR_MESSAGE });
            }
            res.render("newJournalSuccess", { journalID: journals.length, journal: req.body });
        });
    });
});


// ====================================================================================================
// CREATING ENTRIES 
// ====================================================================================================

// getting the list of journals
app.get("/pick-journal-to-write", function (req, res) {
    // retrieves journals from database
    database.journalEntity.find({}, function (err, journals) {
        if (err) {
            throw err;
            res.render("error", { errorMsg: error.DATABASE_ERROR_MESSAGE });
        }
        res.render("writeToJournalSelection", { journals: journals });
    });
});

// page to write the new journal entry
app.get("/write-journal/:ID", function (req, res) {
    // retrieves journal by specific ID
    database.journalEntity.findOne({}, function (err, journal) {
        if (err) {
            throw err;
            res.render("error", { errorMsg: error.DATABASE_ERROR_MESSAGE });
        }
        // if there are no journals, send error page
        if (!journal) {
            res.render("error", { errorMsg: error.NULL_JOURNAL_ERROR_MESSAGE });
            return;
        }
        res.render("writeToJournal", { journal: journal, input: req.query });
    }).where("JournalID").equals(Number(req.params.ID));
});

// creating the entry and committing it to the database, going to a success page
app.post("/create-entry/:ID", urlEncodedParser, function (req, res) {
    // gets all entries to find the number in the database
    database.entryEntity.find({}, function (err, entries) {
        if (err) {
            throw err;
            res.render("error", { errorMsg: error.DATABASE_ERROR_MESSAGE });
        }
        // adds the new entry to the database
        // the ID of the entry is based on how many were counted beforehand
        // the ID of the containing journal is the ID parameter
        // the message and author of the entry are taken from the user inputs in the form
        // the date for the entry is the current date
        database.entryEntity({ EntryID: entries.length, JournalID: req.params.ID, EntryMessage: req.body.message, EntryAuthor: req.body.author, EntryDate: (new Date()) }).save(function (err2) {
            if (err2) {
                throw err2;
                res.render("error", { errorMsg: error.DATABASE_ERROR_MESSAGE });
            }
            // retrieves journal by specific ID
            database.journalEntity.findOne({}, function (err3, journal) {
                if (err3) {
                    throw err3;
                    res.render("error", { errorMsg: error.DATABASE_ERROR_MESSAGE });
                }
                // if there are no journals, send error page
                if (!journal) {
                    res.render("error", { errorMsg: error.NULL_JOURNAL_ERROR_MESSAGE });
                    return;
                }
                res.render("writeToJournalSuccess", { journal: journal, entry: req.body });
            }).where("JournalID").equals(Number(req.params.ID));
        });
    });
});


// The Error page for false URLs works, except that it removes the CSS for the rest of the application for some reason
/*
app.use(function (req, res, next) { 
    res.status(404);

    // respond with html page
    if (req.accepts("html")) {
        res.render("error", { errorMsg: error.PAGE_NOT_FOUND_ERROR_MESSAGE });
        return;
    }
});
*/

// connect to database and start server
database.connect();
app.use(express.static("./public"));
app.listen(3000);