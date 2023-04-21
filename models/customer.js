const mongoose = require('mongoose');

const customerSchema = new mongoose.Schema({

    name: {
        type: String,
        // required:true
    },
    cname: {
        type:String
    },
    email: {
        type: String,
        // required:true 
    },
    phone: {
        type: Number
    },
    // city: {
    //     type: String
    // },
    dob: {
        type: Date
    }
})

const customerModel = mongoose.model('Customer', customerSchema);

module.exports = customerModel;