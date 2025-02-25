
import User from '../model/User.js'
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import config from 'config';
import Article from '../model/Article.js';
import {transliterate} from '../service/transliterate.js'
import { sendVerificationEmail } from '../service/emailService.js';
import { randomBytes } from "crypto";

const generatePassword = () => {
  const chars = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*";
  let password = "";
  for (let i = 0; i < 8; i++) {
    password += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return password;
};

/**
 * Регистрация пользователя (корреспондент + генерация учеток для соавторов)
 */
export const registration = async (req, res) => {
  try {
    const {
      email,
      password,
      lastName,
      firstName,
      fatherName,
      phone,
      organization,
      position,
      rank,
      degree,
      coauthors = [], // 👈 Если нет соавторов, пустой массив
      section,
      articleTitle,
      checked,
      participationType,
      participationForm,
      articleFile,
      avatar,
      role // 👈 Может быть 'correspondent' или 'coauthor'
    } = req.body;

    // Проверяем, нет ли пользователя с таким email
    const isEmailExist = await User.findOne({ email });
    if (isEmailExist) {
      return res.status(400).json({ message: req.t('server.registration.emailExists') });
    }

    // Хэшируем пароль
    const salt = await bcrypt.genSalt(6);
    const hash = await bcrypt.hash(password, salt);

    // Устанавливаем роль пользователя (по умолчанию - корреспондент)
    const userRole = role || "correspondent";

    // Создаём пользователя (корреспондент)
    
    const correspondentLogin = `${transliterate(lastName)}${transliterate(firstName[0])}${transliterate(fatherName ? fatherName[0] : '')}`;

    // ✅ Генерация токена верификации
    const verificationToken = randomBytes(32).toString("hex");

    const correspondent = new User({
      email,
      login: correspondentLogin,
      hashedPassword: password,
      lastname: lastName,
      firstname: firstName,
      fathername: fatherName,
      phone,
      organization,
      position,
      degree,
      rank,
      checked,
      section,
      verificationToken,
      participation_type: participationType,
      participation_form: participationForm,
      
      avatar,
      role: userRole,
    });

    // Сохраняем корреспондента
    await correspondent.save();

    // Создаём статью, если это корреспондент
    let article = null;
    if (userRole === "correspondent" && correspondent?.participation_type ===  "problem") {
      article = new Article({
        title: articleTitle,
        correspondent: correspondent._id,
        section: section,
        file_url: articleFile
      });
      await article.save();
    }

    // Создаём соавторов
    let createdCoauthors = [];
    for (const coauthor of coauthors) {
      const generatedPassword = generatePassword();
      const login = `${transliterate(coauthor.lastName)}${transliterate(coauthor.firstName[0])}${transliterate(coauthor.fatherName ? coauthor.fatherName[0] : '')}`;

      const coauthorUser = new User({
        email: `${login?.toLowerCase()}@auto.coauthor.com`, // Временный email (если не указан)
        login,
        hashedPassword: bcrypt.hashSync(generatedPassword, salt),
        correspondent: correspondent._id,
        lastname: coauthor.lastName,
        firstname: coauthor.firstName,
        fathername: coauthor.fatherName || "",
        organization: coauthor.organization,
        position: coauthor.position,
        degree: coauthor.degree,
        rank: coauthor.rank,
        checked,
        participation_form: coauthor.participationForm,
        correspondent_data: {
          firstname:  correspondent?.firstname,
          lastname: correspondent?.lastname,
          email: correspondent?.email
        },
        role: "coauthor",
      });

      await coauthorUser.save();
      // внизу я пытаюсь передать все данные не только логин и пароль и это необходимо так сделать
      createdCoauthors.push({
        _id: coauthorUser._id, // 👈 Добавляем _id
        email: `${login}@auto.coauthor.com`, // Временный email (если не указан)
        hashedPassword: bcrypt.hashSync(generatedPassword, salt),
        lastname: coauthor.lastName,
        firstname: coauthor.firstName,
        fathername: coauthor.fatherName || "",
        organization: coauthor.organization,
        position: coauthor.position,
        degree: coauthor.degree,
        rank: coauthor.rank,
        participation_form: coauthor.participationForm,
        role: "coauthor",
        login,
        password: generatedPassword,
      });
    }

    correspondent.coauthors = createdCoauthors.map(({ _id, hashedPassword, ...coauthor }) => coauthor);
    await correspondent.save();
    

    // Исключаем хэш пароля перед отправкой клиенту
    const { hashedPassword, ...userData } = correspondent._doc;

    await sendVerificationEmail(email, verificationToken);

    // Генерируем JWT токен
    const token = jwt.sign(
      { _id: correspondent._id, role: userRole },
      config.get("jwt_key"),
      { expiresIn: "1h" }
    );

    res.status(201).json({
      message: req.t('server.registration.success'),
      userData,
      article, // 👈 Отправляем данные статьи (если есть)
      coauthors: createdCoauthors, // 👈 Отправляем логины и пароли соавторов
      token,
    });

  } catch (error) {
    console.error("Ошибка регистрации:", error);
    res.status(500).json({ message: req.t('server.error'), error: error.message });
  }
};

// 📌 Авторизация (логин)
export const login = async (req, res) => {
  try {
    const { login, password } = req.body;
    let user = await User.findOne({ email: login }) || await User.findOne({ login: login }).populate('user');

    if (!user) {
      return res.status(404).json({ message: req.t('server.login.notFound') });
    }

    // if (!user.isVerified) {
    //   return res.status(403).json({ message: "Подтвердите email перед входом" });
    // }

    const isPasswordValid = await bcrypt.compare(password, user.hashedPassword);
    if (user.hashedPassword != password) {
      return res.status(400).json({ message: req.t('server.login.invalidCredentials') });
    }

    // Создаем токен
    const token = jwt.sign({ _id: user._id }, config.get("jwt_key"), { expiresIn: "7d" });

    res.status(200).json({ user, token });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// 📌 Получение профиля пользователя
export const me = async (req, res) => {
  try {
    const userId = req.userId;

    // Находим пользователя + статью, где он корреспондент
    const user = await User.findById(userId).exec();

    const article = await Article.findOne({ correspondent:  user.role == "correspondent" ? userId : user.correspondent?._id }).exec();

    if (!user) {
      return res.status(404).json({ message: req.t('server.user.notFound') });
    }

    // Исключаем пароль
    const { hashedPassword, ...userData } = user._doc;

    res.status(200).json({
      ...userData,
      article, // Теперь статья не содержит дублирования соавторов
    });
  } catch (error) {
    res.status(500).json(req.t('server.error'));
  }
};




export const update = async (req, res) => {
  try {
    const {
      fullname,
      phone,
      address
    } = req.body;

    const userId = req.userId;

    const user = await User.findById(userId);

    await User.updateOne(
      {
        _id: user._id,
      },
      {
        fullname,
        phone,
        address
      }
    );

    res.status(200).json({
      success: true,
    });
  } catch (error) {
    res.status(500).json(error.message);
  }
};

export const updateParticipationType = async (req, res) => {
  try {
    const { userId } = req.params;
    const { type } = req.query; // online, offline, mixed

    if (!["online", "offline", "mixed"].includes(type)) {
      return res.status(400).json({ message: req.t('server.participation.invalidType') });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: req.t('server.user.notFound') });
    }

    user.participation_form = type;
    await user.save();

    return res.send(`
      <h2>✅ ${req.t('server.participation.updated')}</h2>
      <p>${req.t('server.participation.selected')} <b>${type === "online" ? req.t(`server.participation.types.online`) : type === "offline" ? req.t(`server.participation.types.offline`) : req.t(`server.participation.types.mixed`)}</b></p>
    `);
  } catch (error) {
    console.error("Ошибка обновления формы участия:", error);
    return res.status(500).json({ message: req.t('server.error') });
  }
};

export const getParticipants = async (req, res) => {
  try {
    const participants = await User.find({ checked: true }, "lastname firstname fathername organization position rank degree")
      .sort({ lastname: 1 });



    res.status(200).json(participants);
  } catch (error) {
    console.error("Ошибка при получении списка участников:", error);
    res.status(500).json({ message: req.t('server.error') });
  }
};


export const setStatus = async (req, res) => {
  try {
    const { id } = req.body;

    await User.updateOne(
      { _id: id },
      {
        status: "accepted",
      }
    );

    res.status(200).json({
      success: true,
    });
  } catch (error) {
    res.status(500).json(error.message);
  }
}

