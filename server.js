//TO DOS
// #1 add return to all res. statements (usually you do not want to respond more than that, so you can avoid bugs);

const cookieSession = require("cookie-session");
const db = require("./db");
const express = require("express");
const app = express();
const hb = require("express-handlebars");
const { hash, compare } = require("./bc");

// let signatoriesCount;
// let signatories;
let signatureAsUrl;
let usersCount;

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
        secret: `I'm always hangry.`,
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

// #1a GET requests to /register-route
app.get("/register", (req, res) => {
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

// #1b Requests to /register-route
app.post("/register", (req, res) => {
    let first = req.body.first;
    let last = req.body.last;
    let password = req.body.password;
    let email = req.body.email;

    hash(password)
        .then((hashedPw) => {
            console.log("Got into first then");
            db.addUser(first, last, email, hashedPw).then((result) => {
                console.log("Got into second then");
                req.session.userId = result.rows[0].id;
                res.redirect("/petition");
            });
        })
        .catch((err) => {
            console.log("Exception in /register route", err);
            res.render("register", {
                err: true,
            });
        });
});

// //
// app.get("/profile", (req, res) => {
//     return res.render("profile");
// });

// app.post("/profile", (req, res) => {
//     let { age, city, url } = req.body;

//     //SECURITY CHECKS
//     //#1 AGE
//     //const parsedAge = Number.parseInt(age);
//     // if ( parsedAge < 18)

//     // #2 URL
//     if (!url.startsWith("http")) {
//         url ="http://" + url;
//         res.render("/profile", {
//             error: "Please provide an HTTP url."
//         });
//     }

//     db.addProfile({ age, city, url })
//         .then(() => {
//             res.redirect("/petition");
//         })
//         .catch((err) => {
//             console.log(err);
//             res.render("profile", {
//                 error: "Ouups, please try again!",
//             });
//         });
// });

// #2a GET-request to /petition-route
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

// #2b POST Requests to /petition-route
app.post("/petition", (req, res) => {
    let userId = req.session.userId;
    let signature = req.body.signature;

    db.addSignature(userID, signature)
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

// #3 GET request to /thanks-route
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

// #4 GET request to /signatories-route
app.get("/signatories", (req, res) => {
    let userId = req.session.userId;
    let signature = req.session.signature;

    if (signature) {
        db.getSignatoriesUserIds()
            .then((result) => {
                console.log("One: ", result);
                return db.getSignatories(result);
            })
            .then((result) => {
                let signatories = [];
                for (let i = 0; i < result.length; i++) {
                    signatories.push(
                        result[i].rows[0].first + " " + result[i].rows[0].last
                    );
                }

                res.render("signatories", {
                    signatories,
                });
            })
            .catch((err) => {
                console.log("Error in getSignatories: ", err);
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

// #5a GET request to /LOGIN-route
app.get("/login", (req, res) => {
    res.render("login");
});

// #5b POST request to /LOGIN-route
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
                                err: true
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

app.listen(8080, () => console.log("Petition server running..."));
