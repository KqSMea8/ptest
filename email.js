const nodemailer = require('nodemailer');

let config = { service: '126', auth: { user: 'anewman@126.com', pass: 'newman11' } }

function sendMail(to, message, subject) {
    let transporter = nodemailer.createTransport(config);
    transporter.sendMail({
        from: config.auth.user,
        to: to,
        subject: subject,
        text: message
    });
}

exports.sendMail = sendMail;
