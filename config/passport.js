var JwtStrategy = require('passport-jwt').Strategy
var ExtractJwt = require('passport-jwt').ExtractJwt

var User = require('../models/user')
var Config = require('../config/database')

module.exports = function(passport) {
    var opts = {}
    opts.jwtFromRequest = ExtractJwt.fromAuthHeaderWithScheme("jwt")
    opts.secretOrKey = Config.serect
    passport.use(new JwtStrategy(opts, (payload, done) => {
        User.findOne({id: payload.id}, (err, user) => {
            if(err) {
                return done(err, false)
            }
            if(user) {
                return done(null, user)
            } else {
                return done(null, false)
            }
        })
    }))
}