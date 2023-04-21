const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({

    name:{
        type:String,
        // required:true
    },
    email:{
        type:String,
        // required:true 
    },
    password:{
        type:String,
        // required:true
    },
    phone: {
        type:Number
    },
    city: {
        type:String
    },
    dob: {
        type:Date
    },
    image:{
        type:String,
        // required:true
    },
    is_admin:{
        type:Number,
        // required:true
    },
    is_verified:{
        type:Number,
        default:0
    }
    // token: {
    //     type: String,
    //     default:''
    // }
})

const userModel = mongoose.model('User', userSchema);

module.exports = userModel;