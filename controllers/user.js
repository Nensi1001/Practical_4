const User = require('../models/user');
const bcrypt = require('bcryptjs');
const nodemailer = require('nodemailer');
const randomstring = require('randomstring');
const config = require('../config/config');
const { updateOne } = require('../models/user');
const { ObjectId } = require('mongodb');

const create_token = async(req,res)=>{
    try{
        const token  = await jwt.sign({_id:id}, config.sessionSecret)
    }
    catch(err){
        console.log(err.message);
    }
}
const securePassword = async(password)=>{
    try{
        const passwordhash = await bcrypt.hash(password,10);
        return passwordhash;
    }
    catch(err){
        console.log(err.message);
    }
}

//for sending mail
const sendVerifymail = async(name,email,user_id)=>{
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
            subject: 'For verifiction',
            html: '<p>Hi ' + name + ',please click here to \
             <a href="http://localhost:5000/verify?id='+ user_id + '">Verify</a> your mail.  </p>'
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

//for reset password send mail
const resetPasswordmail = async (name, email, token) => {
    try {
        const transporter = nodemailer.createTransport({
            service:'gmail',
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
            subject: 'For Reset Password',
            html: '<p>Hi ' + name + ',please click here to \
             <a href="http://localhost:5000/forget-password?token='+ token + '">Reset</a> your password.  </p>'
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


exports.getRegister = async(req,res)=>{
    try{
        res.render('register')
    }
    catch(err){
        console.log(err);
    }
}

exports.postRegister = async(req,res)=>{
    // const errors = validationResult(req)
    try {
        const user = new User({
            name: req.body.name,
            email: req.body.email,
            password: Math.random(),
            phone: req.body.phone,
            dob:req.body.dob,
            // image: req.file.filename,
            city:req.body.city,
            is_admin:0
        });
        const userData = await user.save();
        if(userData){
            sendVerifymail(req.body.name,req.body.email,userData._id);
            res.render('register',{message:"Your registration has been done Successfully."})
        }
        else{
            res.render('register',{message:"Your registration has been failed. "})

        }
    }
    catch(err){
        console.log(err.message);
    }
}

exports.getverifyMail = async(req,res)=>{
    try{
        const updateInfo = await User.updateOne({_id:req.query.id},{$set:{is_verified:1}});
        // console.log(updateInfo);
        res.render("email-verified", {
            id: req.query.id
        });
    }
    catch(err){
            console.log(err.message);
    }
}

exports.postverifyMail = async (req, res) => {
    try{
        const securepassword = await securePassword(req.body.password);
        const cpassword = req.body.cpassword;
        const isMatch = await bcrypt.compare(cpassword,securepassword);
        if(isMatch){
            await User.updateOne({ _id: req.body.userId }, { $set: { password: securepassword } })
                res.redirect('/login');
            }
            else{
            res.render('email-verified',{message:"Passwords didn't match. "})
            }
    }
    catch(err){
        console.log(err.message);
    }
}

//login user
exports.getLogin = async(req,res)=>{
    try{
        res.render('login');
    }
    catch(err){
        console.log(err.message);
        }
}

exports.postLogin = async(req,res)=>{
    try{
        const email = req.body.email;
        const password = req.body.password;
        const userData = await User.findOne({email:email});

        if(userData){
            const isMatch = await bcrypt.compare(password,userData.password);
            if (isMatch) {
                if(userData.is_verified === 0){
                    res.render('login',{message:"Please verify your email"})
                }
                else{
                    if (userData.is_admin === 1) {
                        req.session.user_id = userData._id;
                        res.redirect('/admin/home');
                    }
                    else {
                        res.redirect('/home');
                    }
                }
            }
            else{
            res.render('login',{message:"Email and password is incorrect."})
            }
        }
        else{   
            res.render('login',{message:"Email and password is incorrect."})
        }
    }
    catch(err){
        console.log(err.message);
        }
}

exports.getHome = async(req,res)=>{
    try {
        const userData = await User.findById({ _id: req.session.user_id });
        res.render('home',{user:userData});
    }
    catch(err){
        console.log(err.message);
        }
}
exports.getLogout = async(req,res)=>{
    try{
        req.session.destroy();
        res.redirect('/');
    }
    catch(err){
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
        const userData = await User.findOne({ email: email })
        if (userData) {
            if (userData.is_verified === 0) {
                res.render('forget', { message: "Please verify your email" })
            }
            else {
                const randomString = randomstring.generate();
                const updatedData = await User.updateOne({ email: email }, { $set: { token: randomString } });
                resetPasswordmail(userData.name, userData.email, randomString);
                res.render('forget',{message:"Please check your mail to reset password."})
            }
        }
        else {
            res.render('forget',{message:"Email is incorrect"})
        }
    }
    catch (err) {
        console.log(err.message);
    }
}
exports.forgetpassword = async (req, res) => {
    try {
        const token = req.query.token;
        const tokenData = await User.findOne({ token: token });
        if (tokenData) {
            res.render('forget-password', { user_id:tokenData._id } )
        }
        else {
            res.render('404', { message: 'Token is invalid.' });
        }
    }
    catch (err) {
        console.log(err.message);
    }
}
exports.resetpassword = async (req, res) => {
    try {
        // const email = req.body.email;
        const password = req.body.password;

        const user_id = req.body.user_id;
        const secure_password = await securePassword(password);
         const updatedData = await User.findOneAndUpdate({_id:user_id},{$set:{password:secure_password,token:''}})
        res.redirect('/');
    }
    catch (err) {
        console.log(err.message);
    }
}

exports.getEdit = async (req, res) => {
    try {
        const id = req.query.id;
        const userData = await User.findById({ _id: new ObjectId(id) });
        if (userData) {
            res.render('edit',{user:userData})
        }
        else {
            res.redirect('/home');
        }
    }
    catch (err) {
        console.log(err.message);
    }   
}

exports.postUpdate = async (req, res) => {
    try {
        if (req.file) {
            const userData = await User.findByIdAndUpdate({ _id: req.body.user_id }, { $set: { name: req.body.name, email: req.body.email,image:req.file.filename } })
        }
        else {
           const userData = await User.findByIdAndUpdate({_id:req.body.user_id},{$set:{name:req.body.name,email:req.body.email}})
        }
        res.redirect('/home');
    }
    catch (err) {
        console.log(err.message);
    }
}
exports.getdashboard = async (req, res) => {
    try {
        res.render('dashboard');
    }
    catch (err) {
        console.log(err.message);
    }
}