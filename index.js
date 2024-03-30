const rateLimit = require("express-rate-limit")
const express = require('express');
const nodemailer = require('nodemailer');
const bodyParser = require('body-parser');
require("dotenv").config();
const cors = require('cors');
const app = express();


const limiter = rateLimit({
	windowMs: 5 * 60 * 60 * 1000, // 15 minutes
	limit: 5, // Limit each IP to 100 requests per `window` (here, per 15 minutes).
	standardHeaders: 'draft-7', // draft-6: `RateLimit-*` headers; draft-7: combined `RateLimit` header
	legacyHeaders: false, // Disable the `X-RateLimit-*` headers.
	// store: ... , // Redis, Memcached, etc. See below.
})


app.use(limiter);
app.use(cors());
const port = process.env.PORT||8080;
console.log(port)
// Middleware to parse incoming request bodies
app.use(bodyParser.json());

const email=process.env.EMAIL;
console.log(email)
// Create a transporter object using SMTP transport
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: email,  // Your Gmail email address
        pass: process.env.PASSWROD           // Your Gmail password or App-Specific Password
    }
});

// Endpoint to send email
app.post('/send-email', (req, res) => {
    const { from, subject, text } = req.body;

    // Email message options
    const mailOptions = {
        from: email,  // Sender email address
        to: email,                         // Recipient email address
        subject: subject,               // Subject line
        text: `User Email: ${from}\nDescription: ${text}`                      // Plain text body
    };

    // Send email
    transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
            console.log('Error occurred:', error);
            res.status(500).send('Error sending email');
        } else {
            console.log('Email sent:', info.response);
            res.send('Email sent successfully');
        }
    });
});

// Start the server
app.listen(port, () => {
    console.log(`Server is listening at http://localhost:${port}`);
});
