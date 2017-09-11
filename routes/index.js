const express = require('express')
const router = express.Router()
const User = require('../models/User')
const Bar = require('../models/Bar')
const passport = require('passport')
const bodyParser = require('body-parser')
const validator = require('validator')
const fetch = require('isomorphic-fetch')
const async = require('async')
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


// TODO: inspect data being sent
//home page
router.get('/', (req, res) => {
  res.render('home', { logout: '' })
})

//route handler just for the failure redirect in requireSignin
router.get('/error', (req, res) => {
  res.render('error', { err: 'invalid email or password.' })
})

//signup page
router.get('/auth', (req, res) => {
  res.render('auth')
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
      res.render('home', { logout: 'Log Out' })
    })
  })
})



//post request for signin
router.post('/signin', requireSignin, (req, res) => {
  res.render('home', { logout: 'Log Out' })
})

router.post('/search/:location', (req, res) => {
  const searchLocation = req.params.location;
  async.waterfall([
    (next) => {
      fetch(`https://api.yelp.com/v3/businesses/search?term=bars&location=${searchLocation}`, {
        'headers': { 'Authorization': 'Bearer 9Q9sxxUVykUTPoSzgPPj_sV_ya5o2-5Fnaj7NDJ7nueKbWWXeEaT2xIjh5MdAxOyFRaKbXVY2umhtAzAj2Dr9rslNXrdZgiTFJHV_kCnBx5FtTRrrlk-WMQeCLGoWXYx' }
      })
      .then(response => response.json())
      .then(response => next(null, response))
      .catch(err => next(err))
    },
    (response, next) => {
      const { businesses } = response;
      const result = businesses.map(business => {
            const { name, image_url, url, location } = business
            const yelp_id = business.id;
            return {
              yelp_id,
              name,
              image_url,
              url,
              location,
              going: []
            }
          })
      const ids = businesses.map(bar => bar.id)
      next(null, result, ids)
    }
  ], (err, response, ids) => {
    if (err) return res.send(err)
    Bar.find({ yelp_id: { $in: ids } }).lean().exec((err, bars) => {
      if (err) return res.send(err)
      bars.forEach(bar => {
        response.forEach(obj => {
          if (obj.yelp_id === bar.yelp_id) {
            obj.going = bar.going;
          }
        })
      })
      res.send(response)
    })
  })
})

router.get('/rsvp/:yelp_id', (req, res) => {
  if (req.isAuthenticated()) {
    Bar.findOneAndUpdate({ yelp_id: req.params.yelp_id }, { $addToSet: { going: req.user.id } }, { upsert: true, new: true}, (err, bar) => {
      if (err) return res.render('home', { logout: 'Log Out' });
      res.render('home', { logout: 'Log Out'})
    })
  } else {
    res.render('auth')
  }
})

router.get('/not-going/:yelp_id', (req, res) => {
  if (req.isAuthenticated()) {
    Bar.findOneAndUpdate({ yelp_id: req.params.yelp_id }, { $pull: { going: req.user.id } }, { maxTimeMS : 1000 }, (err, bar) => {
      if (err) return res.render('error', { err });
      res.render('home', { logout: 'Log Out'})
    })
  } else {
    res.render('auth')
  }
})

//logout route
router.get('/logout', (req, res) => {
  //log out
  req.logout();
  //redirect to home page
  res.render('home', { bars: [], search_location: '', logout: '' })
})
module.exports = router;
