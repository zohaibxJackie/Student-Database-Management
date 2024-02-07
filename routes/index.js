/* jshint esversion: 6 */
/* jshint esversion: 8 */

var express = require('express');
var router = express.Router();
var userModel = require('./users');
var studentModel = require('./student');

var passport = require('passport');
var localStrategy = require('passport-local');
passport.use(new localStrategy(userModel.authenticate()));

const upload = require('./multer');
/* GET home page. */
router.get('/', function (req, res) {
  res.render('index', { PageTitle: "Register Admin" });
});

router.get('/login', function (req, res) {
  res.render('login', { error: req.flash('error'), PageTitle: "Login" });
});

router.get('/home', isLoggedIn, function (req, res) {
  res.render('Home', { PageTitle: "Home" });
});

router.get('/update', isLoggedIn, function (req, res, next) {
  res.render('update', { PageTitle: "Upadate" });
});

router.get('/delete', isLoggedIn, function (req, res, next) {
  res.render('delete', { PageTitle: "Delete Student" });
});

router.get('/search', isLoggedIn, function (req, res, next) {
  res.render('search', { PageTitle: "Search Student" });
});

// register the student
router.post('/registerStudent',upload.single('image'), async function (req, res) {
  try {
    await studentModel.create({
      name: req.body.name,
      rollNumber: req.body.rollNumber,
      image: req.file.filename
    });
    res.redirect("/home");
  } catch (error) {
    if (error.code === 11000) {
      res.status(400).send("This Roll no. already exists");
    } else {
      console.log(error);
      res.status(500).send("some error occurred");
    }
  }
});

router.post('/search_result', async function (req, res) {
  try {
    let result = await studentModel.findOne({ rollNumber: req.body.search }).populate('image');
    if (result) {
      res.render('result', { result });
    } else {
      res.send("No such student with this roll number");
    }
  } catch (error) {
    res.status(500).send("Internet or server errror");
  }
});

router.post('/update', async function (req, res) {
  try {
    await studentModel.updateOne({ rollNumber: req.body.old_num }, { $set: { rollNumber: req.body.new_num } })
      .then(updatedUser => {
        res.send("Student is updated successfully");
      })
      .catch(errror => {
        res.send('some error occured');
      });
  } catch (error) {
    router.send('Internet or server error');
  }
});

router.post('/delete', async function (req, res) {
  try {
    await studentModel.deleteOne({ rollNumber: req.body.roll_num })
      .then(deleted => {
        res.send("student deleted successfully");
      })
      .catch(error => {
        res.send("Roll number is invalid");
      });
  } catch (error) {
    res.send("internet or server issue");
  }
});

// this is for admin only
router.post('/register', function (req, res, next) {
  if (req.body.adminKey !== "123abc") {
    res.send("not admin");
    return;
  }
  const { username } = req.body;
  const userData = new userModel({ username });

  userModel.register(userData, req.body.password)
    .then(function () {
      passport.authenticate('local')(req, res, function () {
        res.redirect('/home');
      });
    });
});

router.post('/login', passport.authenticate('local', {
  successRedirect: '/home',
  failureRedirect: '/login',
  failureFlash: true
}), function (res, req) { });

router.get('/logout', function (req, res) {
  req.logout(function (err) {
    if (err) { return next(err); }
    res.redirect('/');
  });
});


function isLoggedIn(req, res, next) {
  if (req.isAuthenticated()) return next();
  res.redirect('/');
}

module.exports = router;
