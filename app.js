//require packages
var express = require('express'),
    app = express(),
    bodyParser = require('body-parser'),
    path = require('path'),
    request = require('request'),
    mongoose = require('mongoose');
//static to public directory
app.use(express.static('public'));
//set ejs as view engine
app.set('view engine', 'ejs');

//parsing request using bodyparser
app.use(bodyParser.urlencoded({
    extended: true
}))
app.use(bodyParser.json());


//Mongodb setup 
//----------------------------------------------------
mongoose.connect('mongodb://127.0.0.1/blogdb', {
    useMongoClient: true
})

mongoose.Promise = global.Promise;

var schema = mongoose.Schema({
    title: String,
    image: String,
    body: String,
    created: {
        type: Date,
        default: Date.now
    }
});

var blogdb = mongoose.model('blogdb', schema);
//------------------------------------------------------
//example
blogdb.create({
    title: "pet",
    image: "https://i.imgur.com/8pTwPlXb.jpg",
    body: "this dogs are so cute"
});

//RESTfull Routes
app.get('/', (req, res) => {
    
});

//listen port assign
app.listen('8080', () => {
    console.log("Listening at port 8080");
})