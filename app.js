const express = require("express")
const app = express()
const ejs = require("ejs");
const bcrypt = require("bcrypt");
const cors = require("cors");
const User = require("./models/user.model");
require("./config/database")
require("./config/passport")
require("dotenv").config();
const passport = require("passport")
const session = require("express-session");
const MongoStore = require('connect-mongo');

app.set("view engine", "ejs")
app.use(cors())
app.use(express.urlencoded({extended: true}))
app.use(express.json())


app.set('trust proxy', 1) // trust first proxy
app.use(session({
    secret: 'keyboard cat',
    resave: false,
    saveUninitialized: true,
    store: MongoStore.create({
        mongoUrl: `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.n72f5gi.mongodb.net/sessionDB`,
        collectionName: "sessions"
    })
    // cookie: { secure: true }
}))

app.use(passport.initialize());
app.use(passport.session());


// base route
app.get("/", (req, res) => {
    res.render("index")
})

// register : get
app.get("/register", (req, res) => {
    res.render("register")
})

// register : post
app.post("/register", async(req, res) => {
    const user = await User.findOne({username: req.body.username});
    if (user){
        return res.send("Account already used")
    }

    bcrypt.hash(req.body.password, 10, async (err, hash) => {
        const newUser = await User({
            username: req.body.username,
            password: hash
        })
        await newUser.save(newUser).then((user) =>{
            return res.redirect("/login")
        })
    });
    

})
const checkAuthenticated = (req, res, next) => {
    if (req.isAuthenticated()) {
        return res.redirect("/profile")
    }
    next()
}

// login : get
app.get("/login", checkAuthenticated, (req, res) => {
    res.render("login")
})

// login : post
app.post('/login',
    passport.authenticate('local', { failureRedirect: '/login'}),(req, res) => {
    res.redirect('/profile');
});


const checkIsLoggedIn = (req, res, next) => {
    if(req.isAuthenticated()){
        return res.render("profile")
    }
    next()
}

// profile :
app.get("/profile", checkIsLoggedIn, (req, res) => {
    res.redirect("/login")
}) 

// logout :
app.get("/logout", (req, res) => {
    try {
        req.logout((err) => {
            if(err){
                return next(err)
            }
            res.redirect("/")
        })
    } catch (error) {
        res.send(error)
    }
}) 

module.exports = app