var config = require('./configure'),
    express = require('express'),
    router = express.Router(),
    nodemailer = require('nodemailer');



exports.sendMail = async (to, html, subject) => {
    var transporter = nodemailer.createTransport({
    service: 'gmail',
    port:465,
    auth: {
        user: process.env.EMAIL,
        pass: process.env.PASSWORD
    }
});

var mailOptions = {
  from: process.env.EMAIL,
  to: to,
  subject: subject || 'Confirmation of Account',
  html: html
};

transporter.sendMail(mailOptions, function(error, info){
    if (error) {
        console.log(error);
        return {error: error.message}
    } else {
        console.log('Email sent: ' + info.response);
        return {success: info.response}
        }
    });
    transporter.close()
}