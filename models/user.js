const mongoose = require('mongoose')
const bcrypt = require('bcrypt-nodejs')

const UserSchema = new mongoose.Schema({
    username: {
        type: String,
        unique: true,
        required: true
    },
  password: {
        type: String,
        required: true
    }
})

UserSchema.pre('save',function(next) {
    var user = this;
    if(this.isModified('password') || this.isNew) {
        bcrypt.genSalt(10, (err, salt) => {
            if(err) {
                return next(err)
            }

            bcrypt.hash(user.password, salt, null, (err, hash) => {
                if(err) {
                    return next(err)
                }
                user.password = hash
                next()
            })
        })
    }
})

UserSchema.methods.comparePassword = async function (password) {
    return await new Promise((resolve, reject) => {
        bcrypt.compare(password, this.password, (err, isMatch) => {
            if (err) {
                reject(err);
            } else {
                resolve(isMatch);
            }
        });
    });
};

module.exports =  mongoose.model('User', UserSchema)