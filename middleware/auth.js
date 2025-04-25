const jwt = require("jsonwebtoken");

const User = require("../models/user");
const passport = require("../passport");

const auth = {
  isAuthenticatedUser: function () {
    return passport.authenticate("user_jwt", { session: false });
  },
  isAuthenticatedAdmin: function () {
    return passport.authenticate("admin_jwt", { session: false });
  },
  isAdmin: function (req, res, next) {
    next();
    return;
    if (req.user.isAdmin === 1) {
      next();
    } else {
      res.status(400).json({
        status: "failed",
        msg: "You don't has access",
      });
    }
  },
  isAuthenticated: function () {
    return async (req, res, next) => {
      try {
        let token = req.headers["authorization"];
        if (token) {
          token = token.split("Bearer ")[1];
          if (token) {
            user = jwt.verify(token, process.env.JWT_KEY);
            if (user) {
              req.user = await User.findById(user._id);
            }
            next();
          }
        } else {
          res.status(400).json({
            status: "failed",
            msg: "You don't has access",
          });
        }
      } catch (err) {
        console.log("ERRPR", err);
        res.status(500).json({
          status: "failed",
          msg: "server error",
        });
      }
    };
  },
};
module.exports = auth;
