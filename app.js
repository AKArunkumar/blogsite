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
// blogdb.create({
//     title: "pet",
//     image: "https://i.imgur.com/8pTwPlXb.jpg",
//     body: "this dogs are so cute"
//     created:
//     oneh:{type:double, default:0}
//     twoh:{tuype:double, default:0}
// });

//RESTfull Routes
app.get('/',(req,res)=>{
    res.redirect('/blogs')
}) 

app.get('/blogs', (req, res) => {
    blogdb.find({})
        .exec()
        .then(function (blogs){
            // res.send(blogs);
            res.render("blog", {
                blogs : blogs
            })
        }).catch(function(err){
            console.error(err);
            res.render("error");
        });   
});

app.get('/blogs/add', function(req,res){
    res.render('new');

})

app.post('/blogs/new', (req,res)=>{
    blogdb.create(req.body.blog, function(err,result){
        if(err){
            console.error(err);
            res.redirect('/blogs');
        }
        console.log(result);
        res.redirect('/blogs');

    })
});
//listen port assign
app.listen('8080', () => {
    console.log("Listening at port 8080");
})