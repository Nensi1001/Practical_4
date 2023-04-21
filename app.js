const mongoose = require('mongoose');
const express = require('express');
const app = express();

const userRoutes = require('./routes/user');
const adminRoutes = require('./routes/admin');
const customerRoutes = require('./routes/customer');
const serviceRoutes = require('./routes/service');


mongoose.set('strictQuery', false);
mongoose.connect("mongodb+srv://nensijogani:Varsha%4012@node.4gb4ju2.mongodb.net/Prac4")
    .then(() => {
        console.log("connection successfull");
    })
    .catch((err) => console.log(err));

app.use('/', userRoutes);
app.use('/admin', adminRoutes);
app.use('/customer', customerRoutes);
app.use('/service', serviceRoutes);


app.listen(5000);
console.log("Server is running");
