// --------------------------- TO DOs ---------------------------
// #1 So far all the city data I add to the is forced to lower case; now I have to find a way to change the first letter to caps before inserting the data to the signatories template in GET /signatories route; see signatoriesByCity handlebars template for some guidance!
// #2 Check how to handle if someone does leave a input field empty --> currently it is an empty string and then translated into / when retrieved from the database and displayed in the profile-edit tempalte. I have some checks in the POST /PROFILE route but I'm not sure whether this is the right solution
//---------------------------------------------------

const cookieSession = require("cookie-session");
const db = require("./db/db");
const express = require("express");
const app = express();
const hb = require("express-handlebars");
const { hash, compare } = require("./bc");
const COOKIE_SECRET =
    process.env.COOKIE_SECRET || require("./secrets.json").COOKIE_SECRET;

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
//
//
//
// --------------------------- /(REGISTER) route ---------------------------
//
//
app.get("/", (req, res) => {
    let { userId } = req.session;
    let { signature } = req.session;

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

// --------------------------- /PROFILE route ---------------------------

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
        return res.render("profile", {
            err: true,
        });
    }
    if (Number.isNaN(parsedAge)) {
        parsedAge = undefined;
    }

    if (url && !url.startsWith("http")) {
        url = "http://" + url;
        return res.render("profile");
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

// --------------------------- /PROFILE/EDIT route ---------------------------

app.get("/profile/edit", (req, res) => {
    const { userId } = req.session;

    if (userId) {
        db.getAllUserDataByUserId(userId)
            .then((result) => {
                const { first, last, age, city, email, url } = result.rows[0];
                res.render("profile-edit", {
                    first,
                    last,
                    age,
                    city,
                    email,
                    url,
                });
            })
            .catch((err) => {
                console.log("Error in /profile/edit route: ", err);
                res.render("profile-edit", {
                    err: true,
                });
            });
    } else {
        res.redirect("/register");
    }
});

app.post("/profile/edit", (req, res) => {
    let { first, last, age, city, email, url, password } = req.body;
    let { userId } = req.session;
    let userUpdatePromise;

    //SECURITY CHECKS
    let parsedAge = Number.parseInt(age);
    if (parsedAge < 18) {
        return res.render("profile", {
            err: true,
        });
    }

    if (Number.isNaN(parsedAge)) {
        parsedAge = undefined;
    }

    if (url && !url.startsWith("http")) {
        url = "http://" + url;
        return res.render("profile");
    }

    if (password) {
        hash(password)
            .then((hashedPw) => {
                console.log(userId, first, last, email, hashedPw);

                userUpdatePromise = db.updateUser(
                    userId,
                    first,
                    last,
                    email,
                    hashedPw
                );
            })
            .catch((err) => {
                console.log("Exception in /profile/edit route, hashPw", err);
                res.render("register", {
                    err: true,
                });
            });
    } else {
        db.getStoredPassword(email).then((result) => {
            console.log(first, last, email);
            console.log(result);
            const storedPw = result.rows[0].hashed_pw;
            userUpdatePromise = db.updateUser(
                userId,
                first,
                last,
                email,
                storedPw
            );
        });
    }

    Promise.all([userUpdatePromise, db.updateProfile(userId, age, city, url)])
        .then(() => {
            res.redirect("/thanks");
        })
        .catch((err) => {
            console.log("Exception in /profile/edit route, Promise.all: ", err);
            res.render("profile-edit", {
                err: true,
            });
        });
});

// --------------------------- /PETITION route ---------------------------

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

// --------------------------- /THANKS route ---------------------------

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

// --------------------------- /SIGNATURE/DELETE route ---------------------------

app.post("/signature/delete", (req, res) => {
    const { userId } = req.session;

    db.deleteSignature(userId)
        .then(() => {
            req.session.signature = false;
            res.redirect("/petition");
        })
        .catch((err) => {
            console.log("Exception in signature/delete route: ", err);
            res.render("petition", {
                err: true,
            });
        });
});

// --------------------------- /SIGNATORIES route ---------------------------

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
    const { city } = req.params;

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

// --------------------------- /LOGIN route ---------------------------

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
                let storedPassword = result.rows[0].hashed_pw;
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

// --------------------------- SERVER ---------------------------

app.listen(process.env.PORT || 8080, () =>
    console.log("Petition server running...")
);
