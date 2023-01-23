const passport = require("passport");
const bcrypt = require("bcrypt");
const User = require("../models/user.model");
const LocalStrategy = require("passport-local").Strategy


passport.use(
    new LocalStrategy(async(username, password, done) => {
    try {
        const user = await User.findOne({ username: username })
        if (!user) {
            return done(null, false, { message: "Invalid username" });
        }
        if (!bcrypt.compare(password, user.password)) {
            return done(null, false, {message: "Incorrect password"}); 
        }

        return done(null, user);
    } catch (error) {
        return done(error);
    }
    }
));

passport.serializeUser(function (user, done) {
    done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
    try {
        const user = User.findById(id);
        done(null, user);
    } catch (error) {
        done(error, false);
    }
});