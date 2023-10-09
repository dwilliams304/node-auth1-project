// Require `checkUsernameFree`, `checkUsernameExists` and `checkPasswordLength`
// middleware functions from `auth-middleware.js`. You will need them here!
const router = require('express').Router();
const Users = require('../users/users-model');
const bcrypt = require('bcryptjs');
const { checkPasswordLength, 
        checkUsernameExists, 
        checkUsernameFree 
      } = require('./auth-middleware')

/**
  1 [POST] /api/auth/register { "username": "sue", "password": "1234" }

  response:
  status 200
  {
    "user_id": 2,
    "username": "sue"
  }

  response on username taken:
  status 422
  {
    "message": "Username taken"
  }

  response on password three chars or less:
  status 422
  {
    "message": "Password must be longer than 3 chars"
  }
 */
router.post('/register', checkPasswordLength, checkUsernameFree, (req, res, next) => { 
  const { username, password } = req.body;
  const hash = bcrypt.hashSync(password, 12);
  Users.add({ username, password: hash })
    .then(newUser => res.status(201).json(newUser))
    .catch(next)
})

/**
  2 [POST] /api/auth/login { "username": "sue", "password": "1234" }

  response:
  status 200
  {
    "message": "Welcome sue!"
  }

  response on invalid credentials:
  status 401
  {
    "message": "Invalid credentials"
  }
 */
  router.post('/login', checkUsernameExists, (req, res, next) => { //eslint-disable-line
    const { password } = req.body;
    if(bcrypt.compareSync(password, req.user.password)){
      req.session.user = req.user;
      res.status(200).json({message: `Welcome ${req.user.username}`});
    }

    else next({status: 401, messsage: 'Invalid credentials'});
  })

/**
  3 [GET] /api/auth/logout

  response for logged-in users:
  status 200
  {
    "message": "logged out"
  }

  response for not-logged-in users:
  status 200
  {
    "message": "no session"
  }
 */
  router.get('/logout', (req, res, next) => {
    res.json('logout');
  })
 
// Don't forget to add the router to the `exports` object so it can be required in other modules
module.exports = router;