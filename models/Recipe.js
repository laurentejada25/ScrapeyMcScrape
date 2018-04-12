var mongoose = require("mongoose");

//refence to schema constructor
var Schema = mongoose.Schema;

//new schema object
var RecipeSchema = new Schema({
    title: {
        type: String,
        required: true,
        unique: true
    },
    link: {
        type: String,
        required: true
    },
    note: {
        type: Schema.Types.ObjectId,
        ref: "Note"
    }    
});

//model of recipe
var Recipe = mongoose.model("Recipe", RecipeSchema);

//export
module.exports = Recipe;