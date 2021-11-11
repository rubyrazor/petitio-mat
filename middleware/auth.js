function requireLoggedIn(req, res, next) {
    if (!req.session.userId) {
        return res.redirect("/register");
    }
    next();
}

function requireNotLoggedIn(req, res, next) {
    if (req.session.userId) {
        return res.redirect("/petition");
    }
    next();
}

function requireSigned(req, res, next) {
    if (!req.session.signature) {
        return res.redirect("/petition");
    }
    next();
}

function requireNotSigned(req, res, next) {
    if (req.session.signature) {
        return res.redirect("/thanks");
    }
    next();
}

module.exports = {
    requireLoggedIn,
    requireNotLoggedIn,
    requireSigned,
    requireNotSigned,
};
