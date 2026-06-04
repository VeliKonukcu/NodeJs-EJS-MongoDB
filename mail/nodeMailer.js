const nodemailer = require("nodemailer");
const ejs = require("ejs");
const path = require("path");

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.MAIL,
    pass: process.env.PASSWORD,
  },
});

async function sendMail(to, subject, name, html, token) {
  try {
    const htmlPage = await ejs.renderFile(
      path.join(__dirname, `../views/account/${html}.ejs`),
      { name: name, token: token },
    );

    transporter.sendMail({
      from: `"NodeApp" <${process.env.MAIL}>`,
      to: to,
      subject: subject,
      html: htmlPage,
    });
  } catch (err) {
    console.log(err);
  }
}

module.exports = sendMail;
