var express = require('express');
var router = express.Router();
var userModel = require('./users');
var studentModel = require('./student');
var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;
const upload = require('./multer');

// Passport configuration
passport.use(new LocalStrategy(userModel.authenticate()));

// Middleware to check if user is logged in
function isLoggedIn(req, res, next) {
  if (req.isAuthenticated()) {
    return next();
  }
  res.redirect('/');
}

/* GET home page. */
router.get('/', (req, res) => {
  try {
    res.render('index', { PageTitle: "Register Admin" });
  } catch (error) {
    console.log(error);
    res.status(500).send("An error occurred");
  }
});

router.get('/login', (req, res) => {
  try {
    res.render('login', { error: req.flash('error'), PageTitle: "Login" });
  } catch (error) {
    console.log(error);
    res.status(500).send("An error occurred");
  }
});

router.get('/home', isLoggedIn, (req, res) => {
  try {
    res.render('home', { PageTitle: "Home" });
  } catch (error) {
    console.log(error);
    res.status(500).send("An error occurred");
  }
});

router.get('/update', isLoggedIn, (req, res) => {
  try {
    res.render('update', { PageTitle: "Update" });
  } catch (error) {
    console.log(error);
    res.status(500).send("An error occurred");
  }
});

router.get('/delete', isLoggedIn, (req, res) => {
  try {
    res.render('delete', { PageTitle: "Delete Student" });
  } catch (error) {
    console.log(error);
    res.status(500).send("An error occurred");
  }
});

router.get('/search', isLoggedIn, (req, res) => {
  try {
    res.render('search', { PageTitle: "Search Student" });
  } catch (error) {
    console.log(error);
    res.status(500).send("An error occurred");
  }
});

// Register the student
router.post('/registerStudent', upload.single('image'), async (req, res) => {
  try {
    await studentModel.create({
      name: req.body.name,
      rollNumber: req.body.rollNumber,
      image: req.file.filename
    });
    res.redirect("/home");
  } catch (error) {
    console.log(error);
    if (error.code === 11000) {
      res.status(400).send("This Roll number already exists");
    } else {
      res.status(500).send("Some error occurred");
    }
  }
});

router.post('/search_result', async (req, res) => {
  try {
    let result = await studentModel.findOne({ rollNumber: req.body.search }).populate('image');
    if (result) {
      res.render('result', { result });
    } else {
      res.send("No such student with this roll number");
    }
  } catch (error) {
    console.log(error);
    res.status(500).send("Internet or server error");
  }
});

router.post('/update', async (req, res) => {
  try {
    await studentModel.updateOne({ rollNumber: req.body.old_num }, { $set: { rollNumber: req.body.new_num } });
    res.send("Student updated successfully");
  } catch (error) {
    console.log(error);
    res.send('Internet or server error');
  }
});

router.post('/delete', async (req, res) => {
  try {
    await studentModel.deleteOne({ rollNumber: req.body.roll_num });
    res.send("Student deleted successfully");
  } catch (error) {
    console.log(error);
    res.send("Internet or server issue");
  }
});

// This is for admin only
router.post('/register', (req, res, next) => {
  try {
    if (req.body.adminKey !== "123abc") {
      res.send("Not admin");
      return;
    }
    const userData = new userModel({ username: req.body.username });

    userModel.register(userData, req.body.password)
      .then(() => {
        passport.authenticate('local')(req, res, () => {
          res.redirect('/home');
        });
      })
      .catch(error => {
        console.log(error);
        res.send("Registration error");
      });
  } catch (error) {
    console.log(error);
    res.status(500).send("An error occurred");
  }
});

router.post('/login', passport.authenticate('local', {
  successRedirect: '/home',
  failureRedirect: '/login',
  failureFlash: true
}));

// Logout route
router.get('/logout', (req, res) => {
  try {
    req.logout((err) => {
      if (err) {
        console.log(err);
        return next(err);
      }
      res.redirect('/');
    });
  } catch (error) {
    console.log(error);
    res.status(500).send("An error occurred");
  }
});

module.exports = router;