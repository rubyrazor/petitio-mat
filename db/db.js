const spicedPg = require("spiced-pg");
const dbUsername = "postgres";
const dbUserPassword = "posgres";
const database = "petition";

const db = spicedPg( process.env.DATABASE_URL || `postgres:${dbUsername}:${dbUserPassword}@localhost:5432/${database}`
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
    const q = `INSERT INTO signatures (user_id, signature)
                VALUES($1, $2)
                RETURNING id`;
    const params = [userId, signature]; //Is it necessary to check signature as well?
    return db.query(q, params);
};

module.exports.getSignature = (userId) => {
    const q = `SELECT signature FROM signatures WHERE user_id = $1`;
    const params = [userId];
    return db.query(q, params);
};

module.exports.getSignatories = (city = "all") => {
    if (city === "all") {
        const q = `SELECT first, last, age, city, url
                    FROM signatures
                    JOIN users
                    ON signatures.user_id = users.id
                    JOIN profiles
                    ON profiles.user_id = users.id`;
        return db.query(q);
    } else {
        const q = `SELECT first, last, age, url
                    FROM signatures
                    JOIN users
                    ON signatures.user_id = users.id
                    JOIN profiles
                    ON profiles.user_id = users.id
                    WHERE city = ${city}`;
        return db.query(q);
    }
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
    const q = `SELECT id FROM signatures WHERE user_id = $1`;
    const params = [userId];
    return db.query(q, params);
};

module.exports.addProfile = ({ age, city, url, userId }) => {
    const q = `INSERT INTO profiles (age, city, url, user_id)
                VALUES($1, $2, $3, $4)`;
    const params = [age, city, url, userId];
    return db.query(q, params);
};
