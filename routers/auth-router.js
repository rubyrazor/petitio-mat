const express = require("express");
const router = express.Router();
const { requireNotLoggedIn } = require("../middleware/auth");
const { hash, compare } = require("../bc");
const db = require("../db/db");

module.exports.authRouter = router;

//
// --------------------------- /REGISTER route ---------------------------

router.get("/register", requireNotLoggedIn, (req, res) => {
    res.render("register");
});

router.post("/register", requireNotLoggedIn, (req, res) => {
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
            console.log("Exception thrown in /register route", err);
            res.render("register", {
                err: true,
            });
        });
});

//
// --------------------------- /LOGIN route ---------------------------

router.get("/login", requireNotLoggedIn, (req, res) => {
    res.render("login");
});

router.post("/login", requireNotLoggedIn, (req, res) => {
    let password = req.body.password;
    let email = req.body.email;
    let userId;

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
                            console.log("Exception thrown in /login route: ", err);
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
