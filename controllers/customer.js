const Customer = require('../models/customer');
const User = require('../models/user');

const config = require('../config/config');

const { ObjectId } = require('mongodb');

exports.getCustomer = async (req, res) => {
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
        const userData = await Customer.find({
            $or: [
                { name: { $regex: '.*' + search + '.*', $options: 'i' } },
                { email: { $regex: '.*' + search + '.*', $options: 'i' } }

            ]
        })
            .limit(limit * 1)
            .skip((page - 1) * limit)
            .exec();

        const count = await Customer.find({
          
            $or: [
                { name: { $regex: '.*' + search + '.*', $options: 'i' } },
                { email: { $regex: '.*' + search + '.*', $options: 'i' } }

            ]
        })
            .countDocuments();

        // const userData = await Customer.find();   
        res.render('custlist', {
            users: userData,
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

exports.getAddCustomer = async (req, res) => {
    try {
        const user = await User.find({ is_admin: 0 });
                res.render('customer', { dropdown: user });
    }
    catch (err) {
        console.log(err.message);
    }
}

exports.postCustomer = async (req, res) => {
    try {
        const name = req.body.name;
        const cname = req.body.cname;
        const email = req.body.email;
        const phone = req.body.phone;
        const dob = req.body.dob;
        const user = new Customer({
            name: name,
            cname: cname,
            email: email,
            phone: phone,
            dob: dob,
        })
        const userData = await user.save();
        // console.log("Details:",userData);
        if (userData) {
            res.redirect('/customer/custlist')
        }
    }
    catch (err) {
        console.log(err.message);
    }
}
exports.getEditCustomer = async (req, res) => {
    try {
        const id = req.query.id;
        const userData = await Customer.findById({_id:id });
    //    console.log(userData);
        if (userData) {
            res.render('edit-customer', { user: userData });
        }
        else {
            res.redirect('/customer/custlist');
        }
    }
    catch (err) {
        console.log(err.message);
    }
}
exports.postUpdateCustomer = async (req, res) => {
    try {
        const id = req.body.id;
        const name = req.body.name;
        const email = req.body.email;
        const phone = req.body.phone;
        const dob = req.body.dob;
        const userData = await Customer.findByIdAndUpdate({ _id: new ObjectId(id) }, { $set: { name: name, email: email,phone:phone,dob:dob} })
        
        res.redirect('/customer/custlist');
    }
    catch (err) {
        console.log(err.message);
    }
}
exports.getDeleteCustomer = async (req, res) => {
    try {
        const id = req.query.id;
        await Customer.deleteOne({ _id: id });
        res.redirect('/customer/custlist');
    }
    catch (err) {
        console.log(err.message);
    }
}