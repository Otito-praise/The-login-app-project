const express = require("express");
const chalk = require("chalk");
const { dev } = require("./confiq");
const { clientError, serverError } = require("./middlewares/error");
const usersRoute = require("./routes/usersroute");
const connectDatabase = require("./confiq/db");
const adminRoute = require("./routes/admin");

const app = express();

const port = dev.app.port || 3007;

app.set("view engine", "ejs");

app.get("/test", (req, res) => {
  res.render("test");
});

app.use(usersRoute);
app.use("/admin", adminRoute); //routes from admin routes

// this are Middleware i created
app.use(clientError);
app.use(serverError);

app.listen(port, async () => {
  console.log(chalk.blue(`server is running at http:/localhost:${port}`));
  await connectDatabase();
});
