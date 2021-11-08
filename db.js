const spicedPg = require("spiced-pg");
const dbUsername = "postgres";
const dbUserPassword = "posgres";
const database = "petition";

const db = spicedPg(
    `postgres:${dbUsername}:${dbUserPassword}@localhost:5432/${database}`
);
console.log("[db] Connecting to: ", database);

module.exports.addUser = (first, last, email, hashedPw) => {
    const q = `INSERT INTO users (first, last, email, hashedPw)
                VALUES($1, $2, $3, $4)
                RETURNING id`;
    const params = [first, last, email, hashedPw];
    return db.query(q, params);
};

module.exports.getUsers = () => {
    const q = "SELECT * FROM users";
    return db.query(q);
};

module.exports.getCountOfUsers = () => {
    const q = `SELECT COUNT(*) FROM users`;
    console.log("Log in db: ", db.query(q));
    return db.query(q);
};

module.exports.addSignature = (userId, signature) => {
    const q = `INSERT INTO signatures (userId, signature)
                VALUES($1, $2)
                RETURNING id`;
    const params = [userId, signature]; //Is it necessary to check signature as well?
    return db.query(q, params);
};

module.exports.getSignature = (userId) => {
    const q = `SELECT signature FROM signatures WHERE userId = $1`;
    const params = [userId];
    return db.query(q, params);
};

let getSignatoriesUserIds = () => {
    const q = `SELECT userId FROM signatures`;
    return db.query(q); //Check! (I want this to be an array with all the userIds that signed)
};

module.exports.getSignatories = () => {
    getSignatoriesUserIds()
        .then((result) => {
            let signatoriesUserIds = [];
            let arr = [];

            for (let i = 0; i < result.rows.length; i++) {
                signatoriesUserIds.push(result.rows[i].userid);
            }

            for (let i = 0; i < signatoriesUserIds.length; i++) {
                let q = `SELECT * FROM users WHERE id = $1`;
                let params = [signatoriesUserIds[i]];
                arr.push(db.query(q, params));
            }
            return Promise.all(arr);
        })
        .catch((err) => {
            console.log("Exception in getSignatories: ", err);
            return err;
        });
};

module.exports.getStoredPassword = (email) => {
    const q = `SELECT password FROM signatures WHERE email = $1`;
    const params = [email];
    return db.query(q, params);
};
