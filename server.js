const express = require('express');
const exphbs = require('express-handlebars');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const request = require('request');
const logger = require('morgan');
const Note = require("./models/Note.js");
const Recipe = require("./models/Recipe.js");

//web scraping tool
var cheerio = require('cheerio');

//require models
// var db = require("./models");

var db = mongoose.connection;

//port listening to
var PORT = 3030;

//initialize express
const app = express(); 

//handlebars
app.engine("handlebars", exphbs({ defaultLayout: "main" }));
app.set("view engine", "handlebars");

//middleware
// Use morgan logger for logging requests
app.use(logger("dev"));
// Use body-parser for handling form submissions
app.use(bodyParser.urlencoded({ extended: false }));
// Use express.static to serve the public folder as a static directory
app.use(express.static("public"));

//mongoose and connect it to db
mongoose.Promise = Promise;
mongoose.connect("mongodb://localhost:/scrapey");
// , {
// 	useMongoClient: true
// });

//////////////////////ROUTES////////////////////////

//GET route for scraping echo website
app.get("/scrape", function (req, res){
	//grab body of html with request

	// request("http://www.echojs.com/", function(error, response, html){
	request("https://www.allrecipes.com/", function(error, response, html){	
		//load the http website into cheerio and save the variable
		let $ = cheerio.load(html);

		// $("article h2").each(function(i, element){
		$("article h3").each(function(i, element){	
			var result = {};

			//add text and href of every link
			result.title = $(this)
				.children("a")
				.text();
				console.log(result.title)
			result.link = $(this)
				.children("a")
				.attr("href");
				console.log(result.link)

			//recipe model creates new recipe
			var newRecipe = new Recipe(result);
			// console.log(newRecipe,"newrecipe");	

			//save to db
			newRecipe.save(function(err, res){
				if(err){
					console.log(err);
				} 
				else {
					console.log(res);
				}
			})
		})	
	});
	console.log("scrape complete");
	// res.send("Scrape Complete");
	res.redirect("/")
});

//Route for getting all recipes from the db
app.get("/recipes", function(req, res){
	console.log("line 89")
	Recipe.find({}, function(err, result){
		if(err){
			console.log(err);
		}
		else{
			console.log("line 95: ",result)
			return res.json(result)
		}
	})
});

//route for grabbing specific recipe by id, populate with note
app.get("/recipes/:id", function(req, res){
	console.log("line 104:" + req.params.id)
	Recipe.findOne({_id: req.params.id})
	.populate("note")
	.then((Recipe) => {
		console.log(Recipe)
		res.json(Recipe)
	})
	.catch((err) => {
		res.json(err)
	})
});

//route for saving/updating recipe's associated note
// app.post("/recipes/:id", function(req, res){
// 	//create new note
// 	var newNote = new Note(req.body);

// 	//save new note to database
// 	newNote.save(function(err, result){
// 		if(err){
// 			console.log(err);
// 		}
// 		else{
// 			Recipe.findOneAndUpdate({_id: req.params.id}, {"note": result._id})
// 		}
// 	})
// });

app.post("/recipes/:id", function(req, res) {
	// TODO
	// ====
	// save the new note that gets posted to the Notes collection
	// then find an article from the req.params.id
	// and update it's "note" property with the _id of the new note
	Note.create(req.body)
	  .then((Note) => {
		console.log(Note._id)
		return db.Recipe.findOneAndUpdate({ _id: req.params.id}, {note: Note._id}, {new: true})
	  })
	  .then((Recipe) =>{
		res.json(Recipe);
	  })
	  .catch((err) => {
		res.json(err);
	  })
  });

/////////////////START THE SERVER/////////////////
app.listen(PORT, function(){
	console.log("App running on port " + PORT + "!");
});