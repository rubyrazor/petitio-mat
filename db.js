const spicedPg = require("spiced-pg");
const dbUsername = "postgres";
const dbUserPassword = "posgres";
const database = "petition";

const db = spicedPg(
    `postgres:${dbUsername}:${dbUserPassword}@localhost:5432/${database}`
);

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

module.exports.getSignatoriesUserIds = () => {
    const q = `SELECT userId FROM signatures`;
    return db.query(q);
};

module.exports.getSignatories = (objOfSignatoriesUserIds) => {
    let arrOfSignatories = [];
    for (let i = 0; i < objOfSignatoriesUserIds.rows.length; i++) {
        let q = `SELECT first, last FROM users WHERE id = $1`;
        let params = [objOfSignatoriesUserIds.rows[i].userid];
        arrOfSignatories.push(db.query(q, params));
    }
    return Promise.all(arrOfSignatories);
};

module.exports.getStoredPassword = (email) => {
    const q = `SELECT hashedPw FROM users WHERE email = $1`;
    const params = [email];
    return db.query(q, params);
};

module.exports.getUserIdByEmail = (email) => {
    const q = `SELECT id FROM users WHERE email = $1`;
    const params = [email];
    return db.query(q, params);
};

module.exports.checkIfSignatory = (userId) => {
    const q = `SELECT id FROM signatures WHERE userId = $1`;
    const params = [userId];
    return db.query(q, params);
};

// module.exports.addProfile = ({ age, city, url }) => { //UserId should come from cookie-session

//     cont params= [];
//     return db.query( `$1, $2...` , [userId, age, city, url]);
// }
