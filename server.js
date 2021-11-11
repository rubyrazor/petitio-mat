// --------------------------- TO DOs ---------------------------
// --------------------------------------------------------------

const cookieSession = require("cookie-session");
const express = require("express");
const app = express();
const hb = require("express-handlebars");
const COOKIE_SECRET =
    process.env.COOKIE_SECRET || require("./secrets.json").COOKIE_SECRET;
const { authRouter } = require("./routers/auth-router.js");
const { profileRouter } = require("./routers/profile-router.js");
const { petitionRouter } = require("./routers/petition-router.js");

// ??
if (process.env.NODE_ENV == "production") {
    app.use((req, res, next) => {
        if (req.headers["x-forwarded-proto"].startsWith("https")) {
            return next();
        }
        res.redirect(`https://${req.hostname}${req.url}`);
    });
}

//Setting handlebars as view engine
app.engine("handlebars", hb());
app.set("view engine", "handlebars");

// Logs basic information about all requests made to server.
app.use((req, res, next) => {
    console.log(`${req.method} | ${req.url}`);
    next();
});

// Initial configuration: secret is used to to generate the second cookie used which, in turn, is used to verify the integrity of the first cookie.
app.use(
    cookieSession({
        secret: COOKIE_SECRET,
        maxAge: 1000 * 60 * 60 * 24 * 14,
    })
);

// Specifies a directory or directories from which static content (e.g., html, css, images, js files, etc.) should be served.
app.use(express.static("./public"));

// Waits for url-encoded request bodies (such as those that browsers automatically generate when forms using the POST method are submitted), parse them, and make the resulting object available as "req.body".
app.use(
    express.urlencoded({
        extended: false,
    })
);

// Routing
app.use(authRouter);
app.use(profileRouter);
app.use(petitionRouter);

app.listen(process.env.PORT || 8080, () =>
    console.log("Petition server running...")
);
