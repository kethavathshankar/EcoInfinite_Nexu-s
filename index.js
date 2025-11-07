const path = require("path");
const express = require('express');
const mongoose = require('mongoose');
const userRoute = require('./routes/user');
const adminRoute = require('./routes/admin');

const session = require('express-session');
const app = express();
const PORT = 8000;

app.use(express.json());
app.use(express.urlencoded({ extended: false }));


// Session middleware — set up once here
app.use(session({
  secret: 'your_secret_key', // change this to a strong secret in production
  resave: false,
  saveUninitialized: false,
  cookie: { secure: false } // true if using HTTPS
}));


mongoose.connect('mongodb://localhost:27017/wastemanagement')
.then(e => console.log('MongoDB Connected'));

app.set('view engine','ejs')
app.set("views",path.resolve("./views"));
app.use(express.static(path.join(__dirname, 'public'))); // to handle images
app.use(express.urlencoded({ extended: false})); // to handle form data

app.set('views', path.join(__dirname, 'views'));

// Static files
app.use('/static', express.static(path.join(__dirname, 'views')));



app.get('/',(req,res) => {
    res.render("home")
});

app.use("/user",userRoute);
app.use("/admin",adminRoute);


app.listen(PORT, () => console.log(`Server Started at PORT:${PORT}`));
