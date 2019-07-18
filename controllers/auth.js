// https://www.npmjs.com/package/@hapi/joi
// https://www.npmjs.com/package/http-status-codes
const Joi = require('@hapi/joi');
const HttpStatus = require('http-status-codes');

const User = require('../models/userModels');
const Helpers = require('../Helpers/helpers');

const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const dbConfig = require('../config/secret');

module.exports = {

  async CreateUser(req, res) {
    //console.log(req.body);
    const schema = Joi.object().keys({
      username: Joi
        .string()
        .min(5)
        .max(100), //  .required()

      email: Joi.string().email({
        minDomainSegments: 2
      }),
      //password: Joi.string().regex(/^[a-zA-Z0-9]{3,30}$/).required(),
      password: Joi
        .string()
        .min(5)
        .required()
    });
    const {
      error,
      value
    } = Joi.validate(req.body, schema);
    console.log('value: ', value);
    if (error && error.details) {
      return res
        .status(HttpStatus.BAD_REQUEST)
        .json({
          message: error.details
        });
    }

    const userEmail = await User.findOne({
      email: Helpers.lowerCase(req.body.email)
    });
    console.log('USER_EMAIL: ', req.body.email);
    if (userEmail) {
      return res
        .status(HttpStatus.CONFLICT)
        .json({
          message: 'Email already exist'
        });
    }

    const userName = await User.findOne({
      username: Helpers.firstUpper(req.body.username)
    });
    console.log('USERNAME: ', req.body.username);
    if (userName) {
      return res
        .status(HttpStatus.CONFLICT)
        .json({
          message: 'Username already exist'
        });
    }

    return bcrypt.hash(value.password, 10, (err, hash) => {
      if (err) {
        return res
          .status(HttpStatus.BAD_REQUEST)
          .json({
            message: 'Error hashing password'
          });
      }
      const body = {
        username: Helpers.firstUpper(value.username),
        email: Helpers.lowerCase(value.email),
        password: hash
      };

      User.create(body)
        .then(user => {
          const token = jwt.sign({
            data: user
          }, dbConfig.secret, {
            expiresIn: 120 //ms
          });

          res.cookie('auth', token);

          res
            .status(HttpStatus.CREATED)
            .json({
              message: 'User created successfully',
              user,
              token
            });

        })
        .catch(err => {
          res
            .status(HttpStatus.INTERNAL_SERVER_ERROR)
            .json({
              message: 'Error occured'
            });
          console.log('ERR :', err);
        });
      console.log('BODY :', body);
    });
  }
};
