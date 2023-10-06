const moongose = require('mongoose')
const passport = require('passport')
const config = require('../config/database')
require('../config/passport')(passport)
const express = require('express')
const jwt = require('jsonwebtoken')
const User = require('../models/user')
const Book = require('../models/book')
const router = express.Router()
const bcrypt = require('bcrypt-nodejs')

router.post('/signup', async (req, res, next) => {
    try {
        if (!req.body.username || !req.body.password) {
            return res.status(400).json({
                success: false,
                message: 'Please pass username and password'
            });
        }

        const existingUser = await User.findOne({ username: req.body.username });
        if (existingUser) {
            return res.status(409).json({
                success: false,
                message: 'Username already exists'
            });
        }

        const newUser = new User({
            username: req.body.username,
            password: req.body.password
        });

        // Mã hóa mật khẩu trước khi lưu vào cơ sở dữ liệu
        const saltRounds = 10;
        await bcrypt.genSalt(saltRounds, (err, salt, ) => {
            if(err) {
                return next(err)
            }

            bcrypt.hash(newUser.password, salt, null, (err, hash) => {
                if(err) {
                    return next(err)
                }
                newUser.password = hash
            })
        })

        await newUser.save();

        res.json({
            success: true,
            message: 'Successfully created new user.'
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({
            success: false,
            message: 'Internal Server Error'
        });
    }
});

router.post('/signin', async (req, res) => {
    try {
        const user = await User.findOne({ username: req.body.username });
        console.log(user)
        if (!user) {
            return res.status(401).send({
                success: false,
                message: 'Authentication failed'
            });
        }

        const isMatch = await user.comparePassword(req.body.password);
        console.log(isMatch)
        if (!isMatch) {
            const token = jwt.sign({ _id: user._id, username: user.username }, config.serect, { expiresIn: '1h' });

            res.json({
                success: true,
                token: 'JWT ' + token
            });
        } else {
            res.status(401).send({
                success: false,
                message: 'Authentication failed'
            });
        }
    } catch (err) {
        console.error(err);
        res.status(500).send({
            success: false,
            message: 'Internal Server Error'
        });
    }
});

router.post('/book', passport.authenticate('jwt', { session: false}), function(req, res) {
    var token = getToken(req.headers);
    if (token) {
      console.log(req.body);
      var newBook = new Book({
        isbn: req.body.isbn,
        title: req.body.title,
        author: req.body.author,
        publisher: req.body.publisher
      });
  
      newBook.save(function(err) {
        if (err) {
          return res.json({success: false, msg: 'Save book failed.'});
        }
        res.json({success: true, msg: 'Successful created new book.'});
      });
    } else {
      return res.status(403).send({success: false, msg: 'Unauthorized.'});
    }
  });
  

  router.get('/book', passport.authenticate('jwt', { session: false}), function(req, res) {
    var token = getToken(req.headers);
    if (token) {
      Book.find(function (err, books) {
        if (err) return next(err);
        res.json(books);
      });
    } else {
      return res.status(403).send({success: false, msg: 'Unauthorized.'});
    }
  });
  

module.exports = router;