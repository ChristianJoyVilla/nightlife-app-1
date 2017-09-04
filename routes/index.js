const express = require('express')
const router = express.Router()
const User = require('../models/User')
const Bar = require('../models/Bar')
const passport = require('passport')
const bodyParser = require('body-parser')
const validator = require('validator')
const fetch = require('isomorphic-fetch')
require('../services/passport')


const requireSignin = passport.authenticate('local', {
  failureRedirect: '/error'
})

const requireAuth = (req, res, next) => {
  if (req.isAuthenticated()) {
    return next();
  }
  res.render('error', { err: 'not signed in' })
}

//home page
router.get('/', (req, res) => {
  res.render('home', { bars: [] })
})

//route handler just for the failure redirect in requireSignin
router.get('/error', (req, res) => {
  res.render('error', { err: 'invalid email or password.' })
})

//signup page
router.get('/signup-or-in', (req, res) => {
  res.render('signup-or-in')
})

//post request for signup
router.post('/signup', (req, res) => {
  const { username, password } = req.body;
  if (password.length < 6) return res.render('error', { err: 'password must be at least 6 characters. Please try again.' });
  //create new user
  const newUser = new User({ username, password })

  newUser.createUser(newUser, (err, user) => {
    if (err) return res.render('error', { err: err });
    req.login(user, function(err) {
      if (err) return res.render('error', { err: err })
      res.render('home', { bars: [] })
    })
  })
})



//post request for signin
router.post('/signin', requireSignin, (req, res) => {
  res.render('home', { bars: [] });
})

router.post('/search', (req, res) => {
  //fetch(`https://api.yelp.com/v3/businesses/search?term=bars&location=${req.body.location}`, {
    fetch('https://api.yelp.com/v3/businesses/search?term=bars&location=phoenix', {
    'method': 'GET',
    'headers': { 'Authorization': 'Bearer 9Q9sxxUVykUTPoSzgPPj_sV_ya5o2-5Fnaj7NDJ7nueKbWWXeEaT2xIjh5MdAxOyFRaKbXVY2umhtAzAj2Dr9rslNXrdZgiTFJHV_kCnBx5FtTRrrlk-WMQeCLGoWXYx' }
  })
    .then((response) => {
      response.json();
    })
    .then((response) => {
      //response.headers.set('Authorization', 'Bearer 9Q9sxxUVykUTPoSzgPPj_sV_ya5o2-5Fnaj7NDJ7nueKbWWXeEaT2xIjh5MdAxOyFRaKbXVY2umhtAzAj2Dr9rslNXrdZgiTFJHV_kCnBx5FtTRrrlk-WMQeCLGoWXYx');
      console.log(response);
      res.send(response);
      //For each bar, check database for a match. If no match, push object with only name, url, image url, and location into arrayOfBars.
      //Check for a match in the database, and if not put going as 0, if yes, put going as going.length
      //res.render('home', { bars: arrayOfBars })
    })
    .catch(err => console.log('error', err))
})

router.post('/rsvp/:bar', (req, res) => {
  Bar.find
})

//logout route
router.get('/logout', (req, res) => {
  //log out
  req.logout();
  //redirect to home page
  res.render('home', { bars: [] })
})
module.exports = router;
