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
      return res.sendFile(path.join(__dirname, "../views/verify-failed.html"));
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
          <h2 style="color: #1168eb;">Добро пожаловать в конференцию KBU!</h2>
          <p>Ваш аккаунт успешно верифицирован.</p>
          <p><b>Ваши данные:</b></p>
          <ul>
            <li><b>Email:</b> ${user.email}</li>
            <li><b>Логин:</b> ${user.login}</li>
            <li><b>Пароль:</b> ${user.hashedPassword}</li>
          </ul>
          <br/>
          <p>
            <a href="https://conference.buketov.edu.kz/login" 
              style="background-color: #098cf7; color: white; padding: 12px 30px; text-decoration: none; border-radius: 1px;">
              Войти в систему
            </a>
          </p>
          <br/>
          <p><b>Ниже список ваших соавторов:</b></p>
    `;
    let coauthorsList = `<ol>`;
    user?.coauthors?.forEach((coauthor) => {
      coauthorsList += `
        <li><b>${coauthor.firstname} ${coauthor.lastname}</b> (логин: ${coauthor.login}, пароль: ${coauthor.password})</li>
      `;
    });
    coauthorsList += `</ol>
    <br/>
    </div>`;

    await sendEmail(user.email, "Добро пожаловать на конференцию KBU!", welcomeEmail + coauthorsList);


    res.sendFile(path.join(__dirname, "../views/verify-success.html"));
  } catch (error) {
    console.log('error', error)
    res.sendFile(path.join(__dirname, "../views/verify-failed.html"));
  }
};
