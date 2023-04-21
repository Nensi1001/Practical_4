const User = require('../models/user');
const bcrypt = require('bcryptjs');
const randomstring = require('randomstring');
const config = require('../config/config');
const nodemailer = require('nodemailer');
const stripe = require('stripe')('sk_test_51MgnzPSGPDEMOcS92YCxCvswU4XsePaDef0UbZ1G0kHkkFZtIPdfxTVDkVqfT89NZCJWg5a7zOy0EIKKCvpNFXKi00HCTKM1sO');


const ejs = require('ejs');
const pdf = require('html-pdf');
const fs = require('fs');
const path = require('path');
const { response } = require('../routes/admin');
const { findOne } = require('../models/user');
const { ObjectId } = require('mongodb');

const securePassword = async (password) => {
    try {
        const passwordhash = await bcrypt.hash(password, 10);
        return passwordhash;
    }
    catch (err) {
        console.log(err.message);
    }
}
const resetPasswordmail = async (name, email, token) => {
    try {
        const transporter = nodemailer.createTransport({
            service: 'gmail',
            // host: 'smtp.gmail.com',
            // port: 587,
            // secure: false,
            // requireTLS: true,
            auth: {
                user: config.emailUser,
                pass: config.password
            }
        });
        const mailOptions = {
            from: config.emailUser,
            to: email,
            Subject: 'For Reset Password',
            html: '<p>Hi ' + name + ',please click here to \
             <a href="http://localhost:5000/admin/forget-password?token='+ token + '">Reset</a> your password.  </p>'
        }
        transporter.sendMail(mailOptions, function (err, info) {
            if (err) {
                console.log(err);
            }
            else {
                console.log("Email has been sent:- " + info.response);
            }
        })
    }
    catch (err) {
        console.log(err.message);
    }
}

//for sending mail
const addUserMail = async(name,email,password,user_id)=>{
    try{
        const transporter = nodemailer.createTransport({
            service:'gmail',
            // host:'smtp.gmail.com',
            // port:587,
            // secure:true,
            // requireTLS:true,
            auth:{
                user:config.emailUser,
                pass: config.password
            }
        });
        const mailOptions = {
            from: config.emailUser,
            to: email,
            subject: "Admin added you and Verify your mail",
            html: '<p>Hi ' + name + ',please click here to \
             <a href="http://localhost:5000/verify?id='+ user_id + 
             '">Verify</a> your mail. </p> <br> <b>Email:-</b>'+email+'<br><b>Password:-</b>'+password+''
        }
        transporter.sendMail(mailOptions,function(err,info){
            if(err){
                console.log(err);
            }
            else{
                console.log("Email has been sent:- "+info.response);
             }
        })
    }
    catch(err){
        console.log(err.message);
    }
}



exports.getDashboard = async (req, res) => {
    try {
        const userData = await User.findById({ _id: new ObjectId(req.session.user_id )
});
        res.render('home', { admin: userData });
    }
    catch (err) {
        console.log(err.message);
    }
}
exports.getLogout = async (req, res) => {
    try {
        req.session.destroy();
        res.redirect('/admin');
    }
    catch (err) {
        console.log(err.message);
    }
}

exports.getForget = async (req, res) => {
    try {
        
        res.render('forget');
    }
    catch (err) {
        console.log(err.message);
    }
}

exports.postForget = async (req, res) => {
    try {
        const email = req.body.email;
        const userData = await User.findOne({ email: email });
        if (userData) {
            if (userData.is_admin === 0) {
                res.render('forget', { message: 'Email is incorrect' });
            }
            else {
                const randomString = randomstring.generate();
                const updatedData = await User.updateOne({ email: email }, { $set: { token: randomString} });
                resetPasswordmail(userData.name, userData.email);
                res.render('forget', { message: "Please check your mail to reset password." })
            }
        }
        else {
            res.render('forget', { message: 'Email is incorrect' });
        }
    }
    catch (err) {
        console.log(err.message);
    }
}
exports.getForgetPassword = async (req, res) => {
    try {
        const token = req.query.token;
        const tokenData = await User.findOne({ token: token });
        if (tokenData) {
            res.render('forget-password', { user_id: tokenData._id })
        }
        else {
            res.render('404', { message: 'Token is invalid.' });
        }
    }
     catch (err) {
        console.log(err.message);
    }
}
exports.postForgetPassword = async (req, res) => {
    try {
        const email = req.body.email;
        const password = req.body.password;
        const user_id = req.body.user_id;
        const secure_password = await securePassword(password);
        const updatedData = User.findOneAndUpdate({ _id:user_id }, { $set: { password: secure_password, token: '' } })
        res.redirect('/');
    }
    catch (err) {
        console.log(err.message);
    }
}
exports.loadDashboard = async (req, res) => {
    try {
        var search = '';
        if (req.query.search) {
            search = req.query.search
        }
        var page = 1;
        if (req.query.page) {
            page = (req.query.page);
        }
        const limit =  2;
        const userData = await User.find({
            is_admin: 0,
            $or: [
                { name: { $regex: '.*' + search + '.*', $options: 'i' } },
                { email: { $regex: '.*' + search + '.*', $options: 'i' } }

            ]
        })
        .skip((page-1) * limit)
            .limit(limit * 1)
            .exec();
        
        const count = await User.find({
            is_admin: 0,
            $or: [
                { name: { $regex: '.*' + search + '.*', $options: 'i' } },
                { email: { $regex: '.*' + search + '.*', $options: 'i' } }

            ]
        })
            .countDocuments();
    
        res.render('dashboard', {
            users: userData,
            totalPages : Math.ceil(count / limit),
            currentPage : page,
            previous: page - 1,
            next:page+1
        });
    }
    catch (err) {
        console.log(err.message);
    }
}
exports.getNewUser = async(req,res)=>{
    try{
        res.render('new-user');
    }
    catch (err) {
        console.log(err.message);
    }
}
exports.postNewUser = async(req,res)=>{
    try{
        const name = req.body.name;
        const email = req.body.email;
        const phone = req.body.phone;
        const dob = req.body.dob;
        const image = req.file.filename;
        const password = randomstring.generate(8);

        const spassword = await securePassword(password);

        const user = new User({
            name:name,
            email:email,
            image:image,
            password: spassword,
            phone: phone,
            dob:dob,
            is_admin:0
        })
        const userData = await user.save();
        if(userData){
            await addUserMail(name,email,password,userData._id)
            res.redirect('/admin/dashboard')
        }
        else{
            res.render('new-user',{message: 'Something wrong.'})
        }
    }
    catch (err) {
        console.log(err.message);
    }
}
exports.getEditUser = async (req, res) => {
    try {
        const id = req.query.id;
        const userData = await User.findById({ _id: id });
        // console.log(userData);
        if (userData) {
            res.render('edit-user', { user: userData });
        }
        else {
            res.redirect('/admin/home');
        }
    }
    catch (err) {
        console.log(err.message);
    }
}
exports.postUpdateUser = async (req, res) => {
    try {
        const id = req.body.id;
        const name = req.body.name;
        const email = req.body.email;

        if (req.file) {
            const userData = await User.findByIdAndUpdate({ _id: new ObjectId(id) }, { $set: { name: name, email: email, image: req.file.filename } })
        }
        else {
            const userData = await User.findByIdAndUpdate({ _id: new ObjectId(id) }, { $set: { name: name, email: email } })
        }
        res.redirect('/admin/dashboard');
    }
    catch (err) {
        console.log(err.message);
    }
}
exports.getDeleteUser = async (req, res) => {
    try {
        const id = req.query.id;
        await User.deleteOne({ _id: id });
        res.redirect('/admin/dashboard');
    }
    catch (err) {
        console.log(err.message);
    }
}
exports.getExportUser = async (req, res) => {
    try {
        const users = await User.find({ is_admin: 0 })
        const data = {
            users:users
        }
        const filePathName = path.resolve(__dirname, '../views/admin/htmltopdf.ejs');
        const htmlString = fs.readFileSync(filePathName).toString();
        let options = {
            format:'Letter'
        }
        const ejsData = ejs.render(htmlString, data);
        pdf.create(ejsData, options).toFile('users.pdf', (err, response) => {
            if (err) console.log(err);
            
            const filePath = path.resolve(__dirname, '../users.pdf');
            fs.readFile(filePath, (err, file) => {
                if (err) {
                    console.log(err);
                    return res.status(500).json(err);
                }
                res.setHeader('Content-Type', 'application/pdf');
                res.setHeader('Content-Disposition', 'attachment;fiename="users.pdf"');
                res.send(file);
            })

        })
    }
    catch (err) {
        console.log(err.message);
    }
}
