//TO DOS
// #1 add return to all res. statements (usually you do not want to respond more than that, so you can avoid bugs);

const cookieSession = require("cookie-session");
const db = require("./db/db");
const express = require("express");
const app = express();
const hb = require("express-handlebars");
const { hash, compare } = require("./bc");
const { COOKIE_SECRET } = process.env || require("secret.json");

// let signatoriesCount;
// let signatories;
let signatureAsUrl;
let usersCount;

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

// ------
// req to /REGISTER route
// ------

app.get("/", (req, res) => {
    let userId = req.session.userId;
    let signature = req.session.signature;

    if (signature) {
        res.redirect("thanks");
    } else if (userId) {
        res.redirect("petition");
    } else {
        res.render("register");
    }
});

app.post("/", (req, res) => {
    let first = req.body.first;
    let last = req.body.last;
    let password = req.body.password;
    let email = req.body.email;

    hash(password)
        .then((hashedPw) => {
            db.addUser(first, last, email, hashedPw).then((result) => {
                req.session.userId = result.rows[0].id;
                res.redirect("/profile");
            });
        })
        .catch((err) => {
            console.log("Exception in /register route", err);
            res.render("register", {
                err: true,
            });
        });
});

// ------
// req to /PROFILE route
// ------

app.get("/profile", (req, res) => {
    let userId = req.session.userId;

    if (userId) {
        return res.render("profile");
    } else {
        res.redirect("/register");
    }
});

app.post("/profile", (req, res) => {
    let { age, city, url } = req.body;
    let userId = req.session.userId;

    //SECURITY CHECKS
    let parsedAge = Number.parseInt(age);
    if (parsedAge < 18) {
        res.render("profile", {
            err: true,
        });
    }

    if (url && !url.startsWith("http")) {
        url = "http://" + url;
        res.render("profile");
    }

    db.addProfile({ age, city, url, userId })
        .then(() => {
            res.redirect("/petition");
        })
        .catch((err) => {
            console.log(err);
            res.render("profile", {
                err: true,
            });
        });
});

// -------
// req to /PETITION route
// -------

app.get("/petition", (req, res) => {
    let userId = req.session.userId;
    let signature = req.session.signature;

    if (userId) {
        if (signature) {
            res.redirect("thanks");
        } else {
            res.render("petition");
        }
    } else {
        res.redirect("/register");
    }
});

app.post("/petition", (req, res) => {
    let userId = req.session.userId;
    let signature = req.body.signature;

    db.addSignature(userId, signature)
        .then(() => {
            req.session.signature = true;
            res.redirect("/thanks");
        })
        .catch((err) => {
            console.log("Exception in request to /petition route: ", err);
            res.render("petition", {
                err: true,
            });
        });
});

// ------
// req to /THANKS route
// ------

app.get("/thanks", (req, res) => {
    let userId = req.session.userId;
    let signature = req.session.signature;

    if (signature) {
        Promise.all([db.getCountOfUsers(), db.getSignature(userId)])
            .then((result) => {
                usersCount = result[0].rows[0].count;
                signatureAsUrl = result[1].rows[0].signature; //Have to check whether this is still true;
                res.render("thanks", {
                    usersCount,
                    signatureAsUrl,
                });
            })
            .catch((err) => {
                console.log("Exception in request to /thanks route: ", err);
                res.render("thanks", {
                    err: true,
                });
            });
    } else if (userId) {
        res.redirect("/petition");
    } else {
        res.redirect("/register");
    }
});

// --------------------------- /SIGNATORIES route --------------------------

app.get("/signatories", (req, res) => {
    let userId = req.session.userId;
    let signature = req.session.signature;

    if (signature) {
        db.getSignatories()
            .then((result) => {
                let signatories = result.rows;
                console.log(signatories);
                res.render("signatories", {
                    signatories,
                });
            })
            .catch((err) => {
                console.log("Exception in /signatories route: ", err);
                res.render("signatories", {
                    err: true,
                });
            });
    } else if (userId) {
        res.redirect("/petition");
    } else {
        res.redirect("/register");
    }
});

app.get("/signatories/:city", (req, res) => {
    const city = req.params.city;

    db.getSignatories(city)
        .then((result) => {
            let signatories = result.rows;
            console.log(signatories);
            res.render("signatories", {
                signatories,
                city,
            });
        })
        .catch((err) => {
            console.log("Exception in /signatories route: ", err);
            res.render("signatories", {
                err: true,
            });
        });
});

// --------------------------- /LOGIN route --------------------------

app.get("/login", (req, res) => {
    res.render("login");
});

app.post("/login", (req, res) => {
    let password = req.body.password;
    let email = req.body.email;
    let userId;

    console.log(password);
    console.log(email);

    if (password && email) {
        db.getStoredPassword(email)
            .then((result) => {
                let storedPassword = result.rows[0].hashedpw;
                return compare(password, storedPassword);
            })
            .then((result) => {
                if (result) {
                    db.getUserIdByEmail(email)
                        .then((result) => {
                            userId = result.rows[0].id;
                            req.session.userId = userId;
                            return db.checkIfSignatory(userId);
                        })
                        .then((result) => {
                            if (result.rows[0].userId === null) {
                                res.redirect("/petition");
                            } else {
                                req.session.signature = true;
                                res.redirect("/thanks");
                            }
                        })
                        .catch((err) => {
                            console.log("Exception in /login route: ", err);
                            res.render("login", {
                                err: true,
                            });
                        });
                } else {
                    res.render("login", {
                        errorMessage: true,
                    });
                }
            });
    }
});

// -----
// kicking off SERVER
// -----

app.listen(process.env.PORT || 8080, () =>
    console.log("Petition server running...")
);
