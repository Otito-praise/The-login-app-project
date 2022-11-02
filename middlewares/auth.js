// authentication middleware for session
// if the user has session id go the home page (next is working)
const isLoggedIn = async (req, res, next) => {
  try {
    // we are saying if user has session id they go browse/if no session id you wil be redirected to login page
    if (req.session.userid) {
    } else {
      // we use return to stop the next function from execution
      return res.redirect("/login");
    }
    next();
  } catch (error) {
    console.log(error);
  }
};

// created a middleware
const isLoggedOut = async (req, res, next) => {
  try {
    // we are saying if user has session id they can go to home
    if (req.session.userid) {
      // we use return to stop the next function from execution
      return res.redirect("/home");
    }
    next();
  } catch (error) {
    console.log(error);
    next();
  }
};

module.exports = { isLoggedIn, isLoggedOut };
