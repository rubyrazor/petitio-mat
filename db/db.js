const spicedPg = require("spiced-pg");
const dbUsername = "postgres";
const dbUserPassword = "posgres";
const database = "petition";

const db = spicedPg(
    process.env.DATABASE_URL ||
        `postgres:${dbUsername}:${dbUserPassword}@localhost:5432/${database}`
);

function FirstLetterCapsOnly(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
}

// --------------------------- USERS.SQL QUERIES ---------------------------

module.exports.addUser = (first, last, email, hashedPw) => {
    const q = `INSERT INTO users (first, last, email, hashed_pw)
                VALUES($1, $2, $3, $4)
                RETURNING id`;
    const params = [first, last, email, hashedPw];
    return db.query(q, params);
};

module.exports.getUserIdByEmail = (email) => {
    const q = `SELECT id FROM users WHERE email = $1`;
    const params = [email];
    return db.query(q, params);
};

module.exports.getUsers = () => {
    const q = `SELECT * FROM users`;
    return db.query(q);
};

module.exports.getCountOfUsers = () => {
    const q = `SELECT COUNT(*) FROM users`;
    return db.query(q);
};

module.exports.updateUser = (userId, first, last, email, hashedPw) => {
    if (!hashedPw) {
        const q = `UPDATE users
                    SET first = $2,
                        last = $3,
                        email = $4
                    WHERE id = $1`;
        const params = [userId, first, last, email];
        return db.query(q, params);
    } else {
        const q = `UPDATE users
                    SET first = $2,
                        last = $3,
                        email = $4,
                        hashed_pw = $5
                    WHERE id = $1`;
        const params = [userId, first, last, email, hashedPw];
        return db.query(q, params);
    }
};

module.exports.getStoredPassword = (email) => {
    const q = `SELECT hashed_pw FROM users WHERE email = $1`;
    const params = [email];
    return db.query(q, params);
};

// --------------------------- SIGNATURES.SQL QUERIES ---------------------------

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

module.exports.checkIfSignatory = (userId) => {
    const q = `SELECT id FROM signatures WHERE user_id = $1`;
    const params = [userId];
    return db.query(q, params);
};

module.exports.deleteSignature = (userId) => {
    const q = `DELETE FROM signatures
                WHERE user_id = $1`;
    const params = [userId];
    return db.query(q, params);
};
//
//
// --------------------------- PROFILES.SQL QUERIES ---------------------------

module.exports.upsertProfile = (userId, age, city, url) => {
    const q = `INSERT INTO profiles (user_id, age, city, url)
                VALUES ($1, $2, $3, $4)
                ON CONFLICT (user_id)
                DO UPDATE SET age = $2, city = $3, url = $4`;

    const cityFirstLetterCapsOnly = FirstLetterCapsOnly(city.toLowerCase());
    const params = [userId, age, cityFirstLetterCapsOnly, url];
    return db.query(q, params);
};
//
//
// --------------------------- MIXED QUERIES ---------------------------

module.exports.getSignatories = (city) => {
    const mainQuery = `SELECT first, last, age, city, url
                        FROM signatures
                        JOIN users
                        ON signatures.user_id = users.id
                        JOIN profiles
                        ON profiles.user_id = users.id`;
    const condition = `WHERE city = $1`;
    let q;

    if (!city) {
        q = mainQuery;
        return db.query(q);
    } else {
        const cityFirstLetterCapsOnly = FirstLetterCapsOnly(city.toLowerCase());
        const params = [cityFirstLetterCapsOnly];
        q = mainQuery + " " + condition;
        return db.query(q, params);
    }
};

module.exports.getAllUserDataByUserId = (userId) => {
    const q = `SELECT first, last, age, city, email, url
    FROM users
    FULL OUTER JOIN profiles
    ON users.id = profiles.user_id
    WHERE users.id = $1`;

    const params = [userId];
    return db.query(q, params);
};
