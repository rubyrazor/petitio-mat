const { genSalt, hash, compare } = require("bcryptjs");

exports.hash = (password) => {
    return genSalt().then((salt) => {
        console.log("Password: ", password);
        console.log("salt from fn: ", salt);
        return hash(password, salt);
    });
};

exports.compare = compare;
