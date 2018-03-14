var express = require('express'),
    bodyParser = require('body-parser'),
    path = require('path'),
    mongoose = require('mongoose'),
    passport = require('passport'),
    localStrategy = require('passport-local'),
    authusers = require('./models/authusers'),
    user = require('./models/user'),
    comments = require('./models/comments'),
    seedDB = require('./seed');

// seedDB();

var app = express();

//intilize pot
app.set('port', 8082);

// Serving static file
app.use(express.static('public'));


// use viewengine to views
app.set('view engine', 'ejs');

// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({
    extended: true
}))

// parse application/json
app.use(bodyParser.json())

//passport configuration
app.use(require('express-session')({
    secret: "Don't tell anyone",
    resave: false,
    saveUninitialized: false
}));
app.use(passport.initialize());
app.use(passport.session());
passport.use(new localStrategy(authusers.authenticate()));
passport.serializeUser(authusers.serializeUser());
passport.deserializeUser(authusers.deserializeUser());

// mongoose connection
mongoose.connect('mongodb://127.0.0.1/campground', {
    useMongoClient: true
})

//settting loggedin  user 
app.use(function (req, res, next) {
    res.locals.currentUser = req.user;
    next();
})
mongoose.Promise = global.Promise;

//login middleware function
function isLoggedin(req, res, next) {
    if (req.isAuthenticated()) {
        return next();
    }
    res.redirect('/login');
}

// Routes
app.get('/', function (req, res) {
    res.redirect('/campground');
})

app.get('/campground', function (req, res) {
    user.find({})
        .then((users) => {
            // console.log(users);
            res.render('campground', {
                users: users,
                currentUser: req.user
            });
        })
        .catch(function (err) {
            console.error(err);
            res.send(err)
        })

})

app.get('/campground/add', (req, res) => {
    res.render('addcampground');
})

app.post('/campground/add', function (req, res) {

    user.create(req.body.userobj)
        .then((newuser) => {
            console.log("new user is added");
        })
        .catch((err) => {
            console.error(err);
        });

    res.redirect('/campground');
})

app.get('/campground/show/:id', function (req, res) {
    let id = req.params.id;
    user.findById(id)
        .then((userinf) => {
            console.log("user info is fetched");
            let commentarr = [];
            userinf.comments.forEach(function (comment_id) {
                comments.findById(comment_id)
                    .then(function (commenter) {
                        console.log("commenter is fetched");
                        commentarr.push(commenter);
                        console.log(commentarr);
                        res.render('showcampground', {
                            userinf: userinf,
                            comments: commentarr
                        });
                    })
            });

        })
        .catch((err) => {
            console.error(err);
        })

})

//user signup
app.get('/register', function (req, res) {
    res.render('register');
})

app.post('/register', function (req, res) {
    var newuser = new authusers({
        username: req.body.username
    });
    authusers.register(newuser, req.body.password, function (err, use) {
        console.log("above if");
        if (err) {
            console.log("In if");
            console.log(err);
            res.redirect('/register')
        }
        res.redirect('/campground');
    })
});

app.get('/login', function (req, res) {
    res.render('login');
})

app.post('/login', passport.authenticate('local', {
    successRedirect: '/campground',
    failureRedirect: '/login'
}), function (req, res) {

})

app.get('/logout', function (req, res) {
    req.logout();
    res.redirect('/campground');
})

app.get('/addcomment/:id', isLoggedin, function (req, res) {
    let id = req.params.id;
    res.render('addcomment', {
        id: id
    });
})

app.post('/addcomment/:id', function (req, res) {
    let id = req.params.id;
    console.log(id);
    comments.create(req.body.comments)
        .then(function (comment) {
            console.log("comment is added");
            user.findById(id)
                .then(function (rtuser) {
                    console.log(rtuser);
                    rtuser.comments.push(comment._id);
                    rtuser.save()
                        .then(function (user) {
                            console.log("user with comment is added");
                            res.redirect('/campground/show/' + id);
                        })
                        .catch(function (err) {
                            console.error(err);
                        })
                })
        })
        .catch(function (err) {
            console.log(err);
        })
})

app.listen(app.get('port'), () => {
    console.log('server started........');
});
