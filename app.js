require("dotenv").config();

const express = require("express");
const app = express();
const connectDB = require("./config/db");
const expressLayouts = require("express-ejs-layouts"); // for using ejs layout
const cookieParser = require("cookie-parser"); // for using cookie
const mongoStore = require("connect-mongo"); // MongoStore for storing session in the database


const PORT = process.env.PORT || 3000;

connectDB(); // for connecting to the database

// Configuration
app.use(express.json()); // for parsing application/json
app.use(express.urlencoded({ extended: true })); // for parsing application/x-www-form-urlencoded
app.use(express.static("public")); // for using static files (css, js, images, etc.)


// Session

app.use(
    require("express-session")({
        secret: process.env.SESSION_SECRET, // for session secret
        resave: false, // don't save session if unmodified
        saveUninitialized: false, // don't create session until something
        store: mongoStore.create({ mongoUrl: process.env.MONGO_URI }), // for storing session in the database
        cookie: {
            maxAge: 1000 * 60 * 60 * 24, // 24 hours
        },
    })
);

// Set up the middleware to pass the user data to the views
app.use((req, res, next) => {
  res.locals.message = req.session.message;
  delete req.session.message;
  next();
});


// Template Engine
app.use(expressLayouts); // for using ejs layout
app.set("layout",  "layouts/main"); // for setting layout
app.set("view engine", "ejs"); // for setting view engine

// Routes
app.use("/", require("./routes/routes")); // for using routes

app.listen(PORT, () => {    
    console.log(`Server is running on http://localhost:${PORT}`);
});
