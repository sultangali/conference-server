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

export const sendVerificationEmail = async (email, token, lang = "ru") => {
  const verificationLink = `http://localhost:5000/api/user/auth/verify/${token}`;

  const translations = {
    ru: {
      subject: "Подтвердите вашу почту",
      greeting: "Здравствуйте!",
      body: "Перейдите по ссылке, чтобы подтвердить вашу почту:",
      button: "Подтвердить почту"
    },
    en: {
      subject: "Verify Your Email",
      greeting: "Hello!",
      body: "Click the link below to verify your email:",
      button: "Verify Email"
    },
    kz: {
      subject: "Электрондық поштаңызды растаңыз",
      greeting: "Сәлеметсіз бе!",
      body: "Электрондық поштаңызды растау үшін төмендегі сілтемеге өтіңіз:",
      button: "Поштаны растау"
    }
  };

  const t = translations[lang] || translations["ru"];

  const mailOptions = {
    from: "conference.buketov.edu.kz@gmail.com",
    to: email,
    subject: t.subject,
    text: `${t.greeting} ${t.body} ${verificationLink}`,
    html: `
      <div style="font-family: Arial, sans-serif;">
        <p style="font-size: 16px; color: #333;">${t.greeting}</p>
        <p style="font-size: 14px; color: #555;">${t.body}</p>
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
            ${t.button}
        </a>
      </div>
    `,
  };

  await transporter.sendMail(mailOptions);
};
