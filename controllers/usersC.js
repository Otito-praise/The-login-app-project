const { json } = require("body-parser");
const { securePassword, comparePassword } = require("../confiq/securePassword");
const { User } = require("../models/usersmodels");

const { render } = require("../routes/usersroute");

const { getRandomString } = require("../utility/passwordToken");
const { sendResetpEmail } = require("../utility/sendResetpEmail");
const { sendVerifictionEmail } = require("../utility/sendVerificationEmail");

const loadRegister = async (req, res) => {
  // res.send("goodmorning");
  try {
    return res.status(200).render("registration");
  } catch (error) {
    return res.status(500).send({
      message: error.message,
    });
  }
};

// TO SECUREPASSWORD
const registerUser = async (req, res) => {
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
      return res.status(201).render("registration", {
        message: "Registration successful, please verify your email",
      });
    } else {
      return res.status(404).send({ message: "route not found" });
    }
  } catch (error) {
    return res.status(500).send({
      message: error.message,
    });
  }
};

const loadLogin = async (req, res) => {
  // res.send("morning");
  try {
    return res.status(200).render("login");
  } catch (error) {
    return res.status(500).send({
      message: error.message,
    });
  }
};

// To check the password
const loginUser = async (req, res) => {
  console.log("loginUser");
  try {
    const email = req.body.email;
    const password = req.body.password;
    console.log(req.body);
    const userData = await User.findOne({ email: email });

    if (userData) {
      // pls compare and allow user to home
      const isMatched = await comparePassword(password, userData.password);

      if (isMatched) {
        if (userData.isVerify) {
          req.session.userid = userData._id;
          return res.redirect("/home"); //if user is verified access home
        } else {
          return res
            .status(404)
            .render("login", { message: "please verify your email" });
        }

        //WE ARE SETTING THE SECTION
        // req.session.userid = userData._id;
        // return res.redirect("/home");
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
    return res.status(500).send({
      message: error.message,
    });
  }
};

const loadHome = async (req, res) => {
  try {
    const user = await User.findOne({ _id: req.session.userid }); //we use session id to find the user
    // console.log(user);
    return res.status(200).render("home", { user: user });
  } catch (error) {
    return res.status(500).send({
      message: error.message,
    });
  }
};

const logOutUser = async (req, res) => {
  try {
    // to destroy the session we use
    req.session.destroy();
    return res.status(200).redirect("/login");
  } catch (error) {
    return res.status(500).send({
      message: error.message,
    });
  }
};

const verifyEmail = async (req, res) => {
  try {
    const id = req.query.id;

    const userUpdated = await User.updateOne(
      { _id: id },
      {
        $set: {
          isVerify: 1,
        },
      }
    );
    if (userUpdated) {
      return res.render("verification", { message: "verification successful" });
    } else {
      return res.render("verification", {
        message: "verification unsuccessful",
      });
    }
  } catch (error) {
    return res.status(500).send({
      message: error.message,
    });
  }
};

const loadResendVerification = async (req, res) => {
  try {
    return res.render("resend-verification");
  } catch (error) {
    return res.status(500).send({
      message: error.message,
    });
  }
};

// i have to come back to you
const resendVerificationLink = async (req, res) => {
  try {
    const email = req.body.email;
    const userData = await User.findOne({ email: email });
    if (userData) {
      if (userData.isVerify) {
        return res.render("resend-verification", {
          message: "user is already verified",
        });
      } else {
        sendVerifictionEmail(userData.name, userData.email, userData._id);
        return res.render("resend-verification", {
          message: "Verification link has been sent you your email",
        });
      }
    } else {
      return res.render("resend-verification", {
        message: "this email does not exist",
      });
    }
  } catch (error) {
    return res.status(500).send({
      message: error.message,
    });
  }
};

const loadForgetPassword = async (req, res) => {
  try {
    return res.render("forget-password");
  } catch (error) {
    return res.status(500).send({
      message: error.message,
    });
  }
};

const forgetPassword = async (req, res) => {
  try {
    const email = req.body.email;
    const userData = await User.findOne({ email: email });
    if (userData) {
      if (userData.isVerify) {
        const randomString = getRandomString();
        await User.updateOne(
          { email: email },
          {
            $set: {
              token: randomString,
            },
          }
        );
        sendResetpEmail(
          userData.name,
          userData.email,
          userData.id,
          randomString
        );
        return res.render("forget-password", {
          message: "Please check your email for reseting password",
        });
      } else {
        return res.render("forget-password", {
          message: "Verify your email address please",
        });
      }
    } else {
      return res.render("forget-password", { message: "email does not exist" });
    }
  } catch (error) {
    return res.status(500).send({
      message: error.message,
    });
  }
};

const loadResetPassword = async (req, res) => {
  try {
    const token = req.query.token;
    const userData = await User.findOne({ token: token });
    if (userData) {
      return res.render("reset-password", { userId: userData._id });
    }
  } catch (error) {
    return res.status(500).send({
      message: error.message,
    });
  }
};

const resetPassword = async (req, res) => {
  try {
    const password = req.body.password;
    const userId = req.body.userid;

    const hashPassword = await securePassword(password);
    await User.findByIdAndUpdate(
      { _id: userId },
      {
        $set: {
          password: hashPassword,
          //  we return token to default for security
          token: "",
        },
      }
    );

    return res.redirect("/login");
  } catch (error) {
    return res.status(500).send({
      message: error.message,
    });
  }
};

const loadEditProfil = async (req, res) => {
  try {
    const id = req.query.id;
    const user = await User.findById({ _id: id });
    if (user) {
      return res.status(200).render("edit", { user: user });
    } else {
      return res.redirect("/home");
    }
  } catch (error) {
    return res.status(500).send({
      message: error.message,
    });
  }
};

const editUserProfil = async (req, res) => {
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
    return res.redirect("/home");
  } catch (error) {
    return res.status(500).send({
      message: error.message,
    });
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

// DELETING USER WILL COME BACO TO YOU
const deleteUser = async (req, res) => {
  try {
    const id = req.params._id;
    // const id = req.query.id;
    const user = await User.findByIdAndDelete({ _id: id });
    if (user) {
      // res.json("deleted succeessfully");
      return res.redirect("/home");
    } else {
      res.status(500).send("user not found");
    }

    console.log(User);
  } catch (error) {
    console.log(error);
  }
};
module.exports = {
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
  deleteUser,
  loadDeleteUser,
};

// user management
// 1 Register the User
// 2 Login the User
// 3 logout the user
// HOW TO CREATE SEASON
// install: npm install express-session
// 4 session - generate session_id ->store id in the cookies
// if the user is already loggedin ->/home(CAN visit homepage)
// ->registration page(can not go to registration page)

// if the user is already loggedout ->home(can not go to Home)
// instead ->login(the user has to go to loggin and login)
// 5 email verification(SMTP-APP)
// 6.Resend verification email
// 7.Reset password
// I HAVE TO DO USER PROFILE
// 8.show the user prifile AND delete

// Admin management
// !:Admin Register
// 2:login Admin
// 3:reset Addmin password
// 4:add,delete,update user
// 5:pagination
// 6:searching for users
