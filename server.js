const cookieSession = require("cookie-session");
const express = require("express");
const app = express();
const hb = require("express-handlebars");
const COOKIE_SECRET =
    process.env.COOKIE_SECRET || require("./secrets.json").COOKIE_SECRET;
const { authRouter } = require("./routers/auth-router.js");
const { profileRouter } = require("./routers/profile-router.js");
const { petitionRouter } = require("./routers/petition-router.js");
const { landingRouter } = require("./routers/landing-router.js");

// ??
if (process.env.NODE_ENV == "production") {
    app.use((req, res, next) => {
        if (req.headers["x-forwarded-proto"].startsWith("https")) {
            return next();
        }
        res.redirect(`https://${req.hostname}${req.url}`);
    });
}

//Sets handlebars as view engine
app.engine("handlebars", hb());
app.set("view engine", "handlebars");

// Logs basic info about all requests.
app.use((req, res, next) => {
    console.log(`${req.method} request to ${req.url}`);
    next();
});

// Initial configuration of cookie session.
app.use(
    cookieSession({
        secret: COOKIE_SECRET,
        maxAge: 1000 * 60 * 60 * 24 * 14,
    })
);

// Specifies a directory to serve static content.
app.use(express.static("./public"));

// Parses url-encoded request bodies + makes them available as "req.body".
app.use(
    express.urlencoded({
        extended: false,
    })
);

// Routers
app.use(landingRouter);
app.use(authRouter);
app.use(profileRouter);
app.use(petitionRouter);

//Starts server + setup for SuperTest
if (require.main == module) {
    app.listen(process.env.PORT || 8080, () =>
        console.log("I am listening...")
    );
}

exports.app = app;
