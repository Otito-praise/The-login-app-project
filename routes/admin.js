const bodyParser = require("body-parser");
const express = require("express");
const morgan = require("morgan");
const session = require("express-session");

const { upload } = require("../middlewares/uploadFile");
const { dev } = require("../confiq");
const { isLoggedIn, isLoggedOut } = require("../middlewares/adminAuth");
const {
  loadAdminloginView,
  loginAdmin,
  loadHomeView,
  adminLogout,
  loadDashbordView,
  deleteUser,
  loadnewUser,
  AddUser,
} = require("../controllers/adminC");

const adminRoute = express(); //app

// SET UP OUR SECTION
adminRoute.use(
  session({
    secret: dev.app.secret_key,
    resave: false,
    saveUninitialized: true,
  })
);

adminRoute.set("views", "./views/admin");
adminRoute.use(morgan("dev"));

adminRoute.use(express.static("public")); //for my static folder eg images and css

adminRoute.use(bodyParser.json());
adminRoute.use(bodyParser.urlencoded({ extended: true }));

adminRoute.get("/login", isLoggedOut, loadAdminloginView);
adminRoute.post("/login", loginAdmin);
adminRoute.get("/home", isLoggedIn, loadHomeView);

adminRoute.get("/logout", isLoggedIn, adminLogout);
// dashbord controller
adminRoute.get("/dashboard", isLoggedIn, loadDashbordView);

adminRoute.get("/deleteuser", isLoggedIn, deleteUser);

adminRoute.get("/new-User", isLoggedIn, loadnewUser);
adminRoute.post("/new-User", upload.single("image"), AddUser);

module.exports = adminRoute;
