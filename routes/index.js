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
  res.render('home.ejs', { bars: [] })
})

//route handler just for the failure redirect in requireSignin
router.get('/error', (req, res) => {
  res.render('error', { err: 'invalid email or password.' })
})

//signup page
router.get('/signup', (req, res) => {
  res.render('signup')
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
      res.render('create')
    })
  })
})


//signin page
router.get('/signin', (req, res) => {
  res.render('signin')
})

//post request for signin
router.post('/signin', requireSignin, (req, res) => {
  res.render('home');
})

router.post('/search', (req, res) => {
  //fetch(`https://api.yelp.com/v3/businesses/search?term=bars&location=${req.body.location}`, {
    fetch('https://api.yelp.com/v3/businesses/search?term=bars&location=phoenix', {
    'method': 'GET',
    'headers': {'access_token': '9Q9sxxUVykUTPoSzgPPj_sV_ya5o2-5Fnaj7NDJ7nueKbWWXeEaT2xIjh5MdAxOyFRaKbXVY2umhtAzAj2Dr9rslNXrdZgiTFJHV_kCnBx5FtTRrrlk-WMQeCLGoWXYx',
    'expires_in': 643256054,
    'token_type': 'Bearer'
    }
  })
    .then(response => response.json())
    .then(response => res.send(response))
    .catch(err => console.log('error', err))
})

//logout route
router.get('/logout', (req, res) => {
  //log out
  req.logout();
  //redirect to home page
  res.render('home')
})
module.exports = router;
