//To DOs
// (SOLVED)#1 Check how req.body of submit-form looks like, so I can pass the values accordingly to the addSignature function in the app.post request to the /petition route;
// (SOLVED) #2 If POST request to /petition fails, add info that when rendering petition page a additional info should be displayed on that page that signature was unsuccessful (add error message)
// #3 Sanitise input in post route (DOMPURIFY)

//--------------

const cookieSession = require("cookie-session");
const db = require("./db");
const express = require("express");
const app = express();
const hb = require("express-handlebars");

let signatoriesCount;
let signatories;
let signatureAsUrl;

//Setting handlebars as view engine
app.engine("handlebars", hb());
app.set("view engine", "handlebars");

// Logs basic information about all requests made to this server.
app.use((req, res, next) => {
    console.log(`${req.method} | ${req.url}`);
    next();
});

// Initial configuration: secret is used to to generate the second cookie used to verify the integrity of the first cookie.
app.use(
    cookieSession({
        secret: `I'm always hangry.`,
        maxAge: 1000 * 60 * 60 * 24 * 14,
    })
);

// Sepecifies a directory or directories from which static content (e.g., html, css, images, js files, etc.) should be served.
app.use(express.static("./public"));

// Waits for urlencoded request bodies (such as those that browsers automatically generate when forms using the POST method are submitted), parse them, and make the resulting object available as "req.body".
app.use(
    express.urlencoded({
        extended: false,
    })
);

// #1 Requests through the /petition-route
app.get("/", (req, res) => {
    //Check for chookies if has already signed & if yes, redirect, if not, render /petition
    if (req.session.signatureId) {
        res.redirect("/thanks");
    } else {
        res.render("petition");
    }
});

app.post("/", (req, res) => {
    let firstName = req.body.firstName;
    let lastName = req.body.lastName;
    let signature = req.body.signature;
    console.log("signature: ", signature);

    db.addSignature(firstName, lastName, signature)
        .then((result) => {
            req.session.signatureId = result.rows[0].id;
            res.redirect("/thanks");
        })
        .catch((err) => {
            console.log(err);
            res.render("petitionErrorMessage");
        });
});

// #2 Requests through the /thanks-route
app.get("/thanks", (req, res) => {
    if (req.session.signatureId) {
        Promise.all([
            db.getCountOfSignatories(),
            db.getSignature(req.session.signatureId),
        ])
            .then((result) => {
                console.log("Result of Promise.all: ", result);
                signatoriesCount = result[0].rows[0].count;
                signatureAsUrl = result[1].rows[0].signatures;
                console.log(signatureAsUrl);
                res.render("thanks", {
                    signatoriesCount,
                    signatureAsUrl,
                });
            })
            .catch((err) =>
                console.log("Error in request through /thanks route: ", err)
            );
    } else {
        res.redirect("/");
    }
});

// #3 Requests through the /signatories-route
app.get("/signatories", (req, res) => {
    if (req.session.signatureId) {
        console.log("I got in /signatories routes");
        db.getSignatories()
            .then((result) => {
                console.log("Log of signatories: ", result);
                signatories = result.rows;
                res.render("signatories", {
                    signatories,
                });
            })
            .catch((err) => console.log("Error in getSignatories: ", err));
    } else {
        res.redirect("/");
    }
});

app.listen(8080, () => console.log("Petition server running..."));
