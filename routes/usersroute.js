const bodyParser = require("body-parser");
const express = require("express");
const morgan = require("morgan");
const session = require("express-session");
const {
  loadRegister,
  registerUser,
  loadLogin,
  loginUser,
  loadHome,
  logOutUser,
  verifyEmail,
  loadResendVerification,
  resendVerificationLink,
  loadForgetPassword,
  forgetPassword,
  loadResetPassword,
  resetPassword,
  loadEditProfil,
  editUserProfil,
  loadDeleteUser,
} = require("../controllers/usersC");
const { upload } = require("../middlewares/uploadFile");
const { dev } = require("../confiq");
const { isLoggedIn, isLoggedOut } = require("../middlewares/auth");

const usersRoute = express(); //app

// SET UP OUR SECTION
usersRoute.use(
  session({
    secret: dev.app.secret_key,
    resave: false,
    saveUninitialized: true,
  })
);

usersRoute.use(morgan("dev"));
usersRoute.use(express.static("public")); //for my static folder eg images and css

usersRoute.use(bodyParser.json());
usersRoute.use(bodyParser.urlencoded({ extended: true }));

// user is not logged in- session_is
usersRoute.get("/register", isLoggedOut, loadRegister);
usersRoute.post("/register", upload.single("image"), registerUser);

// midlleware should only be applied to get routes
// FOR LOGIN
usersRoute.get("/login", isLoggedOut, loadLogin);
usersRoute.post("/loginUser", loginUser);
usersRoute.get("/home", isLoggedIn, loadHome);
usersRoute.get("/logout", isLoggedIn, logOutUser);
usersRoute.get("/verify", isLoggedOut, verifyEmail);
usersRoute.get("/resend-verification", isLoggedOut, loadResendVerification);
usersRoute.post("/resend-verification", isLoggedOut, resendVerificationLink);

usersRoute.get("/forget-password", isLoggedOut, loadForgetPassword);
usersRoute.post("/forget-password", isLoggedOut, forgetPassword);
usersRoute.get("/reset-password", isLoggedOut, loadResetPassword);
usersRoute.post("/reset-password", isLoggedOut, resetPassword);

usersRoute.get("/edit", isLoggedIn, loadEditProfil);
usersRoute.post("/edit", upload.single("image"), editUserProfil);

usersRoute.get("/delete", isLoggedIn, loadDeleteUser);

module.exports = usersRoute;
