const express = require("express");
const router = express.Router();
const { requireLoggedIn } = require("../middleware/auth");
const db = require("../db/db");
const { hash, compare } = require("../bc");


// --------------------------- /PROFILE route ---------------------------

router.get("/profile", requireLoggedIn, (req, res) => {
    return res.render("profile");
});

router.post("/profile", requireLoggedIn, (req, res) => {
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
            console.log("Exception in POST /profile --> db.addProfile: ", err);
            res.render("profile", {
                err: true,
            });
        });
});

// --------------------------- /PROFILE/EDIT route ---------------------------

router.get("/profile/edit", requireLoggedIn, (req, res) => {
    const { userId } = req.session;

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
            console.log("Exception in POST /profile/edit --> db.getAllUserDataByUserId: ", err);
            res.render("profile-edit", {
                err: true,
            });
        });
});

router.post("/profile/edit", requireLoggedIn, (req, res) => {
    let { userId } = req.session;
    let { first, last, email, password, age, city, url } = req.body;
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
        return res.render("profile", {
            err: true,
        });
    }

    if (password) {
        hash(password)
            .then((hashedPw) => {
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
        userUpdatePromise = db.updateUser(userId, first, last, email);
    }

    Promise.all([userUpdatePromise, db.upsertProfile(userId, age, city, url)])
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

module.exports.profileRouter = router;