const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const userSchema = new Schema({
    fullName: {type: String, required: true},
    email: {type:String, unique: true, required: true},
    password: {type: String ,required: true},
    createOn: {type: Date, default: new Date().getTime()}
});

module.exports =mongoose.model('User', userSchema);