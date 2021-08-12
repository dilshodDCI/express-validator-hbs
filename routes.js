const express = require("express");
const router = express.Router();

const bcrypt = require("bcrypt");
const User = require("./models/user");

const { check, validationResult } = require("express-validator");

router.get("/", function (req, res) {
  res.render("user");
});

router.post(
  "/create-user",
  [
    check("name").notEmpty().withMessage("Name is required").trim(),
    check("email", "Email is required").isEmail().normalizeEmail(),
    check("password", "Password is required")
      .isLength({ min: 4 })
      .custom((val, { req }) => {
        if (val !== req.body.confirm_password) {
          throw new Error("Password don't match!");
        } else {
          return val;
        }
      }),
  ],
  (req, res) => {
    const errors = validationResult(req).array(); //array of errors
    if (errors.length > 0) {
      req.session.errors = errors;
      res.redirect("/user");
    } else {
      bcrypt.hash(req.body.password, 10, (err, hash) => {
        if (err) {
          res.status(500).json({ error: err });
        } else {
          const user = new User({
            name: req.body.name,
            email: req.body.email,
            password: hash,
          });
          user
            .save()
            .then((result) => {
              console.log("Result: ", result);
              const userName = result.name;
              res.render("welcome", { userName });
            })
            .catch((err) => {
              res.status(500).json({ error: err });
            });
        }
      });
    }
  }
);

router.get("/user", (req, res) => {
  res.render("user", { errors: req.session.errors });
});

module.exports = router;
