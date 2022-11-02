const { comparePassword } = require("../confiq/securePassword");
const { User } = require("../models/usersmodels");

const { sendVerifictionEmail } = require("../utility/sendVerificationEmail");

const loadAdminloginView = async (req, res) => {
  try {
    return res.status(200).render("login");
  } catch (error) {
    res.status(500).send({
      message: error.message,
    });
  }
};

const loadHomeView = async (req, res) => {
  try {
    const admin = await User.findOne({ _id: req.session.adminid });
    return res.status(200).render("home", { admin: admin });
  } catch (error) {
    res.status(500).send({
      message: error.message,
    });
  }
};

const adminLogout = async (req, res) => {
  try {
    // to destroy the session we use
    req.session.destroy();
    return res.status(200).redirect("/admin/login");
  } catch (error) {
    res.status(500).send({
      message: error.message,
    });
  }
};

const loginAdmin = async (req, res) => {
  try {
    const email = req.body.email;
    const password = req.body.password;
    console.log(req.body);
    const adminData = await User.findOne({ email: email });

    if (adminData) {
      // pls compare and allow user to home
      const isMatched = await comparePassword(password, adminData.password);

      if (isMatched) {
        if (adminData.isVerify) {
          req.session.userid = adminData._id;
          return res.redirect("/admin/home"); //if user is verified access home
        } else {
          return res
            .status(404)
            .render("login", { message: "please verify your email" });
        }

        //WE ARE SETTING THE SECTION
        // req.session.userid = userData._id;
        // res.redirect("/home");
      } else {
        return res
          .status(404)
          .render("login", { message: "email & password did not match" });
      }
    } else {
      res.status(404).send({ message: "user does not exist" });
    }

    return res.status(200).render("login");
  } catch (error) {
    res.status(500).send({
      message: error.message,
    });
  }
};

const adminDashboard = async (req, res) => {
  try {
    return res.render("dashboard");
  } catch (error) {
    console.log(error.message);
  }
};

const loadDashbordView = async (req, res) => {
  try {
    const users = await User.find({ isAdmin: 0 });
    // console.log(users); //loading all users that are not admin
    return res.status(200).render("dashboard", { users: users });
  } catch (error) {
    res.status(500).send({
      message: error.message,
    });
  }
};

// Edith and Update a user for Admin
const editAdminProfil = async (req, res) => {
  try {
    const id = req.body.user_id;
    console.log(req.body.User);
    if (req.file) {
      const user = await User.findByIdAndUpdate(
        { _id: id },
        {
          $set: {
            name: req.body.name,
            email: req.body.email,
            image: req.file.filename,
          },
        }
      );
    } else {
      const user = await User.findByIdAndUpdate(
        { _id: id },
        {
          $set: {
            name: req.body.name,
            email: req.body.email,
          },
        }
      );
    }
    return res.redirect("/admin/home");
  } catch (error) {
    return res.status(500).send({
      message: error.message,
    });
  }
};

const deleteUser = async (req, res) => {
  try {
    const id = req.query._id;
    // const id = req.query.id;
    const user = await User.findByIdAndDelete({ _id: id });
    if (user) {
      // res.json("deleted succeessfully");
      return res.redirect("/admin/dashboard");
    } else {
      res.status(500).send("user not found");
    }
  } catch (error) {
    console.log(error);
  }
};

const loadDeleteUser = async (req, res) => {
  try {
    const id = req.params._id;
    const user = await User.findByIdAndDelete({ _id: id });
    if (user) {
      return res.status(200).render("delete", { user: user });
    } else {
      return res.redirect("/home");
    }
  } catch (error) {
    return res.status(500).send({
      message: error.message,
    });
  }
};

// To ADD A NEW USER WHO RESUMD WORK
const loadnewUser = async (req, res) => {
  try {
    return res.render("new-user");
  } catch (error) {
    return res.status(500).send({
      message: error.message,
    });
  }
};

// TO ADD NEWUSER

const AddUser = async (req, res) => {
  try {
    const password = req.body.password;
    const hashPassword = await securePassword(password);
    const newUser = new User({
      name: req.body.name,
      email: req.body.email,
      password: hashPassword,
      image: req.file.filename,
      isAdmin: 0,
    });

    const userData = await newUser.save();
    if (userData) {
      sendVerifictionEmail(userData.name, userData.email, userData._id);
      return res.status(201).redirect("/admin/dashboard", {
        message: "Registration successful, please verify your email",
      });
    } else {
      return res.status(404).send({ message: "something went wrong" });
    }
  } catch (error) {
    return res.status(500).send({
      message: error.message,
    });
  }
};
// const AddUser = async(req,res)=>{
//     try {
//         const name = req.body.name;
//         const email = req.body.email;
//         const image = req.file.filename;
//         const password = Randomstring.generate(10);

//     } catch (error) {
//         res.status(500).send({
//             message: error.message
//         })
//     }
// }

module.exports = {
  loadAdminloginView,
  loginAdmin,
  loadHomeView,
  adminLogout,
  loadDashbordView,
  editAdminProfil,
  adminDashboard,
  deleteUser,
  loadDeleteUser,
  loadnewUser,
  AddUser,
};
