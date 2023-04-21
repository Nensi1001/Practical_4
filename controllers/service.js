const Service = require('../models/service');
const Customer = require('../models/customer');
const stripe = require('stripe')('sk_test_51MgnzPSGPDEMOcS92YCxCvswU4XsePaDef0UbZ1G0kHkkFZtIPdfxTVDkVqfT89NZCJWg5a7zOy0EIKKCvpNFXKi00HCTKM1sO');

const { ObjectId } = require('mongodb');

exports.getService = async (req, res) => {
    try {
        var search = '';
        if (req.query.search) {
            search = req.query.search
        }
        var page = 1;
        if (req.query.page) {
            page = req.query.page;
        }
        const limit = 2;
        const serviceData = await Service.find({
            $or: [
                { customer_name: { $regex: '.*' + search + '.*', $options: 'i' } },
                // { vehicle_number: { $regex: '.*' + search + '.*' } }

            ]
        })
            .limit(limit * 1)
            .skip((page - 1) * limit)
            .exec();

        const count = await Service.find({

            $or: [
                { customer_name: { $regex: '.*' + search + '.*', $options: 'i' } },
                // { vehicle_number: { $regex: '.*' + search + '.*' } }

            ]
        })
            .countDocuments();

        res.render('servicelist', {
            services: serviceData,
            totalPages: Math.ceil(count / limit),
            currentPage: page,
            previous: page - 1,
            next: page + 1
        });
    }
    catch (err) {
        console.log(err.message);
    }
}

exports.getAddService = async (req, res) => {
    try {
        const service = await Customer.find();
        res.render('service', { dropdown: service });
    }
    catch (err) {
        console.log(err.message);
    }
}

exports.postService = async (req, res) => {
    try {
        const name = req.body.cname;
        const vehicle = req.body.vehicle;
        const pickup = req.body.pickup;
        const drop = req.body.drop;
        const price = req.body.price;
        const payamt = req.body.payamt;
        const service = new Service({
            customer_name: name,
            vehicle_number: vehicle,
            pickup_date: pickup,
            drop_date: drop,
            service_price: price,
            payable_amount: payamt
        })
        const serviceData = await service.save();
      
        if (serviceData) {
            res.redirect('/service/servicelist')
        }
    }
    catch (err) {
        console.log(err.message);
    }
}
exports.getEditService = async (req, res) => {
    try {
        const id = req.query.id;
        const serviceData = await Service.findById({ _id: id });
        //    console.log(userData);
        if (serviceData) {
            res.render('edit-service', { service: serviceData });
        }
        else {
            res.redirect('/service/servicelist');
        }
    }
    catch (err) {
        console.log(err.message);
    }
}
exports.postUpdateService = async (req, res) => {
    try {
        const id = req.body.id;
        const name = req.body.cname;
        const vehicle = req.body.vehicle;
        const pickup = req.body.pickup;
        const drop = req.body.drop;
        const price = req.body.price;
        const payamt = req.body.payamt;
        const serviceData = await Service.findByIdAndUpdate({ _id: new ObjectId(id) }, {
            $set: {
                customer_name: name,
                vehicle_number: vehicle,
                pickup_date: pickup,
                drop_date: drop,
                service_price: price,
                payable_amount: payamt
            }
        })

        res.redirect('/service/servicelist');
    }
    catch (err) {
        console.log(err.message);
    }
}
exports.getDeleteService = async (req, res) => {
    try {
        const id = req.query.id;
        await Service.deleteOne({ _id: id });
        res.redirect('/service/servicelist');
    }
    catch (err) {
        console.log(err.message);
    }
}
exports.getpayment = async (req, res) => {
    const data = await Service.findById({ _id: req.query.id });
    res.render('checkout', {
        key: 'pk_test_51MgnzPSGPDEMOcS9Pa4se01r0og6EcIBQlD6GwNk3pZ9epajUZ38uReYQ0lZ0yuO8yUNZrqqr5SH3ZEoFIrsUMBP001XhEhBqd'
    , service:data
    });
}


exports.postpayments = async (req, res) => {

    const {customer_name, payable_amount} = req.body
    const session = await stripe.checkout.sessions.create({
        payment_method_types: ['card'],
        line_items: [
            {
                // price: 'price_1MgosESGPDEMOcS9kDWEPRqK',
                product_data: {
                    currency: "INR",
                    product_data: {
                        name:customer_name,
                    },
                    unit_amount: payable_amount * 100
                },
                quantity: 1,
            },
        ],
        mode: 'payment',
        success_url: 'http://localhost:5000/html/success.html',

        cancel_url: 'http://localhost:5000/html/cancel.html'
    });

    res.redirect(303, session.url);

}