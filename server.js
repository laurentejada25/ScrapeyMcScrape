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
	request("http://www.echojs.com/", function(error, response, html){
		//load the http website into cheerio and save the variable
		let $ = cheerio.load(html);

		$("article h2").each(function(i, element){
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
			var newRecipe = new Recipe(req.body);
			console.log(newRecipe);	

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
	res.redirect("/");
});

//Route for getting all recipes from the db
app.get("/recipe", function(req, res){
	// console.log("hello there")
	db.Recipe.find({})
	.then(function (dbRecipe){
		res.json(dbRecipe);
	})
	.catch(function (err){
		res.json(err);
	})
});

//route for grabbing specific recipe by id, populate with note
app.get("/recipes/:id", function(req, res){
	db.Recipe.findOne({_id: req.params.id})
	.populate("note")
	.then(function(dbRecipe){
		console.log(dbRecipe)
		res.json(dbRecipe)
	})
	.catch(function(err){
		res.json(err);
	})
});

//route for saving/updating recipe's associated note
// app.post("recipes/:id", function(req, res){
// 	db.Note.create(req.body)
// })

/////////////////START THE SERVER/////////////////
app.listen(PORT, function(){
	console.log("App running on port " + PORT + "!");
});