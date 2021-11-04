//To DOs
// (SOLVED)#1 Check how req.body of submit-form looks like, so I can pass the values accordingly to the addSignature function in the app.post request to the /petition route;
// #2 If POST request to /petition fails, add info that when rendering petition page a additional info should be displayed on that page that signature was unsuccessful (add error message)

//--------------

const cookieParser = require("cookie-parser");
const db = require("./db");
const express = require("express");
const app = express();
const hb = require("express-handlebars");

let signatoriesCount;

//Setting handlebars as view engine
app.engine("handlebars", hb());
app.set("view engine", "handlebars");

// Logs basic information about all requests made to this server
app.use((req, res, next) => {
    console.log(`${req.method} | ${req.url}`);
    next();
});

// This will cause an object named cookies containing values from the cookie request header to be attached to request objects.
app.use(cookieParser());

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
    if (req.cookies.signatory) {
        res.redirect("thanks");
    } else {
        res.render("petition");
    }
});

app.post("/", (req, res) => {
    console.log(req.body);
    let firstName = req.body.firstName;
    let lastName = req.body.lastName;
    let signature = req.body.signature;

    db.addSignature(firstName, lastName, signature)
        .then(() => {
            res.cookie("signatory", "true");
            res.redirect("thanks");
        })
        .catch((err) => {
            console.log(err);
            res.render("petition");
            // #### (TO DO #2)
        });
});

// #2 Requests through the /thanks-route
app.get("/thanks", (req, res) => {
    if (req.cookies.signatory) {
        db.getCountOfSignatories()
            .then((result) => {
                console.log("Log in then: ", result);
                signatoriesCount = result.rows[0].count;
                res.render("thanks", {
                    signatoriesCount,
                });
                
            })
            .catch((err) =>
                console.log("Error in request through /thanks route: ", err)
            );
    } else {
        res.redirect("/");
    }
});

// // #3 Requests through the /signatories-route
// app.get("/signatories", (req, res) => {
//     if (req.cookies.signatory) {
//         db.getSignatories();
//         res.render("signatories", {

//         });
//     } else {
//         res.render("petition");
//     }
// });

app.listen(8080, () => console.log("Petition server running..."));

// app.get("/actors", (req, res) => {
//     db.getActors()
//         .then((results) => {
//             console.log("Results from getActors: ", results);
//         })
//         .catch((err) => console.log("Error in getActors: ", err));
// });

// app.post("/add-actor", (req, res) => {
//     console.log("Got here!");
//     db.addActor("Janelle Monáe", 36)
//         .then(() => console.log("Yes, adding actor worked"))
//         .catch((err) => console.log("Error in addActor: ", err));
// });
