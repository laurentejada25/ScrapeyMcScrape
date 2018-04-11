var mongoose = require("mongoose");

//save reference to schema constructor
var Schema = mongoose.Schema;

//create new noteschema object
var NoteSchema = new Schema({
    title: String,
    body: String
});

//create model using mongoose model method
var Note = mongoose.model("Note", NoteSchema);

module.exports = Note;