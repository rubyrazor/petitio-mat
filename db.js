// TO DOs:
// #1 Change getSignatories so that I receive only first name, last name, signature, or is there a way to use the entire data in the way I need?;
// #2 Once server routes are set up, check whether querystring of getCountOfSignatories works;
// #3 Ask how to create signatories database

const spicedPg = require("spiced-pg");
const dbUsername = "postgres";
const dbUserPassword = "posgres";
const database = "petition";

const db = spicedPg(
    `postgres:${dbUsername}:${dbUserPassword}@localhost:5432/${database}`
);
console.log("[db] Connecting to: ", database);

module.exports.addSignature = (firstName, lastName, signature) => {
    console.log("addSignature got called");
    const q = `INSERT INTO signatories ("first name", "last name", signatures)
                VALUES($1, $2, $3)
                RETURNING id`;
    const params = [firstName, lastName, signature];
    return db.query(q, params);
};

module.exports.getSignature = (signatureId) => {
    const q = `SELECT signatures FROM signatories WHERE id = $1`;
    const params = [signatureId];
    return db.query(q, params);
};

module.exports.getSignatories = () => {
    const q = "SELECT * FROM signatories";
    return db.query(q);
};

module.exports.getCountOfSignatories = () => {
    const q = `SELECT COUNT(*) FROM signatories`;
    console.log("Log in db: ", db.query(q));
    return db.query(q);
};

//SQL INJECTIONS

//SELECT * FROM actors --> MAY GET ENTIRE DATA
//DROP TABLE IF CONTAINS "user"
