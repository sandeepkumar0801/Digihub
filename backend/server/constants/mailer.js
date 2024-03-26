require("dotenv/config");
const nodemailer = require("nodemailer");

var smtpTransport = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: process.env.SMTP_PORT,
    auth:
    {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASSWORD
    },
    tls: {
        // do not fail on invalid certs
        rejectUnauthorized: false,
    },
});


// sends mail
exports.sendMail = (options) => {
    let mailOptions = {
        from: process.env.SMTP_USER,
        to: process.env.MAIL_TO,
        subject: options.subject,
        html: options.body
    };

    // send mail with defined transport object
    smtpTransport.sendMail(mailOptions, (error, info) => {
        if (error) {
          //  //console.log('error: ', error);
        }
    });
};