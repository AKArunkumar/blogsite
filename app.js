
//require packages
var express = require('express'),
    expressSanitizer = require('express-sanitizer');
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
//app use in sanitizer
app.use(expressSanitizer());


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
            // console.log(blogs);
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
    req.body.blog.body = req.sanitize(req.body.blog.body);
    blogdb.create(req.body.blog, function(err,result){
        if(err){
            console.error(err);
            res.redirect('/blogs');
        }
        // console.log(result);
        res.redirect('/blogs');
    })
});

app.get('/blogs/:id', function(req,res){
    let id = req.params.id;
    blogdb.findById(id, function(err, result){
        if(err){
            console.error(err);
            res.redirect("/blogs");
        }
        // console.log(result);
        res.render("show", {
            blog:result
        })
    })
});

app.get('/blogs/:id/delete', function(req,res){
    let id = req.params.id;
    blogdb.findByIdAndRemove(id).then(function(rem){
        console.log(rem);
        console.log("then");
        res.redirect('/blogs');
    }).catch(function(err){
        console.error(err);
        console.log('catch');
        res.redirect("/blogs");        
    })
})

app.get('/blogs/:id/edit', function(req,res){
    let id = req.params.id;
    blogdb.findById(id, function(err, result){
        if(err){
            console.error(err);
        }
        console.log(result);
        res.render("edit", {
            blog:result
        })
    })
    
})


app.post('/blogs/:id/edit', (req,res)=>{
    req.body.blog.body = req.sanitize(req.body.blog.body);        
    let id = req.params.id;
    blogdb.update({_id:id}, req.body.blog, function(err,suc){
        if(err){
            res.send(err);
        }
        res.redirect('/blogs');
    })
    });

//listen port assign
app.listen('8080', () => {
    console.log("Listening at port 8080");
})