const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  host: 'smtp.zoho.com',
  port: 465,
  secure: true, //ssl
  auth: {
    user: 'kylewilichowski@zohomail.com',
    pass: 'abqzFJ7BkSYq',
  },
});

const sendEmail = async (subject, body) => {
  const mailOptions = {
    from: 'kylewilichowski@zohomail.com',
    to: ['theanglersatticvtg@gmail.com'],
    subject,
    text: body,
    html: body
  };

  await transporter.sendMail(mailOptions).then(console.log);
};

module.exports = sendEmail;