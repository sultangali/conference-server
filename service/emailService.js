import nodemailer from "nodemailer";
import config from "config";

const transporter = nodemailer.createTransport({
    service: "Gmail",
    host: "smtp.gmail.com",
    port: 465, 
//   host: 'smtp.buketov.edu.kz' || 'mail.buketov.edu.kz',
  auth: {
    user: "conference.buketov.edu.kz@gmail.com",
    pass: "yboy acpa ukcj yctb",
  },
  tls: {
    rejectUnauthorized: false
  }
});

export const sendVerificationEmail = async (email, token) => {
  const verificationLink = `http://localhost:5000/api/user/auth/verify/${token}`;

  const mailOptions = {
    from: "conference.buketov.edu.kz@gmail.com",
    to: email,
    subject: "Подтвердите вашу почту",
    text: `Привет! Перейдите по ссылке для подтверждения почты: ${verificationLink}`,
    html: `
      <div style="font-family: Arial, sans-serif;">
        <p style="font-size: 16px; color: #333;">Привет!</p>
        <p style="font-size: 14px; color: #555;">
          Перейдите по ссылке, чтобы подтвердить вашу почту:
        </p>
        <a href="${verificationLink}" 
          style="
            display: inline-block;
            text-decoration: none;
            background-color: #098cf7;
            color: white;
            padding: 12px 30px;
            font-size: 16px;
            border-radius: 1px;
            font-weight: bold;
            margin-top: 10px;
          ">
            Подтвердить почту
        </a>
      </div>
    `,
  };

  await transporter.sendMail(mailOptions);
};
