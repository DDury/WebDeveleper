const express = require("express");

const db = require("../data/database");

const router = express.Router();

const bcrypt = require("bcryptjs");

router.get("/", function (req, res) {
  res.render("welcome");
});

router.get("/signup", function (req, res) {
  res.render("signup");
});

router.get("/login", function (req, res) {
  res.render("login");
});

router.post("/signup", async function (req, res) {
  const data = req.body;
  const email = data.email;
  const cfemail = data["confirm-email"];
  const pw = data.password;
  const hashpw = await bcrypt.hash(pw, 12);
  const existemail = await db
    .getDb()
    .collection("userdata")
    .findOne({ email: email });
  if (existemail) {
    console.log("email already taken");
    return res.redirect("/signup");
  } else {
    await db.getDb().collection("userdata").insertOne({
      email: email,
      password: hashpw,
    });
    res.redirect("/login");
  }
});

router.post("/login", async function (req, res) {
  const currentUser = await db
    .getDb()
    .collection("userdata")
    .findOne({ email: req.body.email });

  if (!currentUser) {
    console.log("no user");
    return res.redirect("/login");
  }
  const verify = await bcrypt.compare(req.body.password, currentUser.password);

  if (verify) {
    console.log("welcome!");
    req.session.user = {
      id: currentUser._id.toString(),
      email: currentUser.email,
    };
    req.session.isAuthenticated = true;
    req.session.save(function () {
      return res.redirect("/admin");
    });
  } else {
    console.log("wrong password");
    res.redirect("/login");
  }
});

router.get("/admin", function (req, res) {
  if (!req.session.isAuthenticated) {
    return res.status(401).render("401");
  } else {
    res.render("admin");
    // console.log("Session:", req.session);
  }
});

router.post("/logout", function (req, res) {
  req.session.user = null;
  req.session.isAuthenticated = null;
  res.redirect("/");
});

module.exports = router;