const express = require("express");
const { requireNotLoggedIn } = require("../middleware/auth");
const router = express.Router();

module.exports.landingRouter = router;

router.get("/", requireNotLoggedIn, (req, res) => {
    res.render("landingpage");
});
