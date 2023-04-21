const mongoose = require('mongoose');

const serviceSchema = new mongoose.Schema({

    customer_name: {
        type:String
    },
    vehicle_number: {
        type:Number
    },
    pickup_date: {
        type:Date
    },
    drop_date: {
        type:Date
    },
    service_price: {
        type:Number
    },
    payable_amount: {
        type: Number
    }
})

const serviceModel = mongoose.model('Service', serviceSchema);

module.exports = serviceModel;