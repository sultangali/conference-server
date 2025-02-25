import User from "../model/User.js";
import path from "path";
import { fileURLToPath } from "url";
import { sendVerificationEmail } from "../service/emailService.js";
import { sendEmail } from "../service/mailSend.js";
// Для работы с `__dirname` в ES-модулях
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const verifyEmail = async (req, res) => {
  try {
    const { token } = req.params;

    const user = await User.findOne({ verificationToken: token });
    if (!user) {
      return res.send(`
        <!DOCTYPE html>
        <html lang="${req.language}">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>${req.t('server.verification.failed.title')}</title>
            <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css" rel="stylesheet">
        </head>
        <body class="d-flex justify-content-center align-items-center vh-100">
            <div class="alert alert-danger text-center" style="max-width: 500px; border-radius: 0px">
             <div class="text-center"><img style="height: 100px; width: auto; margin-bottom: 12px" src="https://colab.ws/storage/images/resized/vYmGTEdbLFsSobJVwZNKM7C8V7rBRljRki1IsMOL_medium.webp"/></div>
              
             <h4>${req.t('server.verification.failed.header')}</h4>
                <p>${req.t('server.verification.failed.message')}</p>
                <a href="http://localhost:5173/registration" class="btn btn-secondary" style="border-radius: 0px">${req.t('server.verification.failed.button')}</a>
            </div>
        </body>
        </html>
      `);
    }

    user.isVerified = true;

    user.verificationToken = null;
    await user.save();


    if (user.role === "correspondent") {
      await User.updateMany(
        { "correspondent_data.email": user.email },
        { $set: { isVerified: true } }
      );
    }

    const welcomeEmail = `
        <div style="font-family: Arial, sans-serif; padding: 20px; border: 1px solid #ddd; border-radius: 10px;">
          <h2 style="color: #1168eb;">${req.t("server.email.welcome.title")}</h2>
          <p>${req.t("server.email.welcome.verified")}</p>
          <p><b>${req.t("server.email.account")}</b></p>
          <ul>
            <li><b>Email:</b> ${user.email}</li>
            <li><b>${req.t("server.email.login")}</b> ${user.login}</li>
            <li><b>${req.t("server.email.password")}</b> ${user.hashedPassword}</li>
          </ul>
          <br/>
          <p>
            <a href="https://conference.buketov.edu.kz/login" 
              style="background-color: #098cf7; color: white; padding: 12px 30px; text-decoration: none; border-radius: 1px;">
               ${req.t("server.email.loginButton")}
            </a>
          </p>
          <br/>
          <p><b>${req.t("server.email.coauthorsList")}</b></p>
    `;
    let coauthorsList = `<ol>`;
    user?.coauthors?.forEach((coauthor) => {
      coauthorsList += `
        <li><b>${coauthor.firstname} ${coauthor.lastname}</b> (${req.t("server.email.login")} ${coauthor.login}, ${req.t("server.email.password")} ${coauthor.password})</li>
      `;
    });
    coauthorsList += `</ol>
    <br/>
    </div>`;

    await sendEmail(user.email,  req.t("server.email.welcome.subject"), welcomeEmail + coauthorsList);


    return res.send(`
      <!DOCTYPE html>
      <html lang="${req.language}">
      <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>${req.t('server.verification.success.title')}</title>
          <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css" rel="stylesheet">
      </head>
      <body class="d-flex justify-content-center align-items-center vh-100">
          <div class="alert alert-success text-center" style="max-width: 500px; border-radius: 0px">
              <div class="text-center"><img style="height: 100px; width: auto;  margin-bottom: 12px" src="https://colab.ws/storage/images/resized/vYmGTEdbLFsSobJVwZNKM7C8V7rBRljRki1IsMOL_medium.webp"/></div>
              <h4>${req.t('server.verification.success.header')}</h4>
              <p>${req.t('server.verification.success.message')}</p>
              <a href="http://localhost:5173/profile" class="btn btn-primary" style="border-radius: 0px">${req.t('server.verification.success.button')}</a>
          </div>
      </body>
      </html>
    `);
  } catch (error) {
    console.log('error', error)
    return res.send(`
      <!DOCTYPE html>
      <html lang="${req.language}">
      <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>${req.t('server.verification.failed.title')}</title>
          <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css" rel="stylesheet">
      </head>
      <body class="d-flex justify-content-center align-items-center vh-100">
          <div class="alert alert-danger text-center" style="max-width: 500px;">
           <div class="text-center"><img style="height: 100px; width: auto;  margin-bottom: 12px" src="https://colab.ws/storage/images/resized/vYmGTEdbLFsSobJVwZNKM7C8V7rBRljRki1IsMOL_medium.webp"/></div>
         
           <h4>${req.t('server.verification.failed.header')}</h4>
              <p>${req.t('server.verification.failed.message')}</p>
              <a href="http://localhost:5173/registration" class="btn btn-secondary">${req.t('server.verification.failed.button')}</a>
          </div>
      </body>
      </html>
    `);
  }
};
