//File that has bcrypt code --> We then export it

const { genSalt, hash, compare } = require("bcryptjs");

//Accepts plain-text password(see argument)
exports.hash = (password) => {
    return genSalt().then((salt) => {
        console.log("Password: ", password);
        console.log("salt from fn: ", salt);
        return hash(password, salt);
    });
};



//Returns a boolean: If hashed input matches stored hash it returns true, if not false
//#1 Only use in /login route
exports.compare = compare;

//takes two arg
// comapre (arg1, arg2)
//arg1 = plane text input
//arg2 = hashed pw stored in the database for that user --> get that via the email; psql query: What is the hashed pw associated with this email? 
// compare then will return boolean -> If true: access; if false: deny access;
