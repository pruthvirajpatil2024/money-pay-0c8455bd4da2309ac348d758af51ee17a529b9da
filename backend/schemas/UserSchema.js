const {Schema, model} = require('mongoose');

const UserSchema = new Schema({
    firstName: {
        type: String,
        required: true,
        trim: true,
        minLength: 3,
        maxLenght: 30
    },
    lastName: {
        type: String,
        required: true,
        trim: true,
        minLength: 3,
        maxLenght: 30
    },    
    email: {
        type: String,
        required: true,
        unique: true,
        trim: true,
    },
    password: {
        type: String,
        required: true,
        trim: true,
        minLength: 3
    },
    avatar: {
        type: String,
    }
});

const User = model('user', UserSchema);
module.exports = User;