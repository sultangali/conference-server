
import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  service: "Gmail",
  host: "smtp.gmail.com",
  port: 465, 
  auth: {
    user: "conference.buketov.edu.kz@gmail.com",
    pass: "yboy acpa ukcj yctb",
  },
  tls: {
    rejectUnauthorized: false
  }
});

export const sendEmail = async (to, subject, text) => {
  const mailOptions = {
    from: `"MIT Buketov`,
    to,
    subject,
    html: text
  };

  await transporter.sendMail(mailOptions);
};

