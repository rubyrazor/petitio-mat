const express = require("express");
const {
    requireLoggedIn,
    requireSigned,
    requireNotSigned,
} = require("../middleware/auth");
const router = express.Router();
const db = require("../db/db");

// --------------------------- /PETITION route ---------------------------

router.get("/petition", requireLoggedIn, requireNotSigned, (req, res) => {
    res.render("petition");
});

router.post("/petition", (req, res) => {
    let userId = req.session.userId;
    let signature = req.body.signature;

    db.addSignature(userId, signature)
        .then(() => {
            req.session.signature = true;
            res.redirect("/thanks");
        })
        .catch((err) => {
            console.log("Exception in POST /petition: ", err);
            res.render("petition", {
                err: true,
            });
        });
});

// --------------------------- /THANKS route ---------------------------

router.get("/thanks", requireSigned, (req, res) => {
    let signatureAsUrl;
    let usersCount;
    let userId = req.session.userId;

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
            console.log("Exception in GET /thanks: ", err);
            res.render("thanks", {
                err: true,
            });
        });
});

// --------------------------- /SIGNATURE/DELETE route ---------------------------

router.post("/signature/delete", (req, res) => {
    const { userId } = req.session;

    db.deleteSignature(userId)
        .then(() => {
            req.session.signature = false;
            res.redirect("/petition");
        })
        .catch((err) => {
            console.log("Exception in POST /signature/delete : ", err);
            res.render("petition", {
                err: true,
            });
        });
});

// --------------------------- /SIGNATORIES route ---------------------------

router.get("/signatories", requireSigned, (req, res) => {
    db.getSignatories()
        .then((result) => {
            let signatories = result.rows;
            console.log(signatories);
            res.render("signatories", {
                signatories,
            });
        })
        .catch((err) => {
            console.log("Exception in GET /signatories: ", err);
            res.render("signatories", {
                err: true,
            });
        });
});

router.get("/signatories/:city", requireSigned, (req, res) => {
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
            console.log("Exception in GET /signatories/:city: ", err);
            res.render("signatories", {
                err: true,
            });
        });
});

module.exports.petitionRouter = router;
