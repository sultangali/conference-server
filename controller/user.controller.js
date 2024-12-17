
import User from '../model/User.js'
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import config from 'config';
import Article from '../model/Article.js';
export const registration = async (req, res) => {
  try {
    // Из запроса деструктурируем корректные поля
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
      articleCode,
      authors,
      section,
      participationType,
      participationForm,
      avatar
    } = req.body;

    // Проверяем, нет ли пользователя с таким email
    const isEmailExist = await User.findOne({ email });
    if (isEmailExist) {
      return res.status(400).json({
        message: "Пользователь с таким email уже зарегистрирован",
      });
    }

    // Хэшируем пароль
    const salt = await bcrypt.genSalt(6);
    const hash = await bcrypt.hash(password, salt);

    // Создаём документ в базе
    const document = new User({
      email,
      hashedPassword: hash,
      lastname: lastName,
      firstname: firstName,
      fathername: fatherName,
      phone,
      organization,
      position,
      degree,
      rank,
      authors,
      section,
      participation_type: participationType,
      participation_form: participationForm,
      avatar
    });

    // Сохраняем
    const user = await document.save();

    // Если нужно связать пользователя со статьей при регистрации:
    if (articleCode) {
      const article = await Article.findOne({ code: articleCode });
      if (article) {
        article.authors.push(user._id);
        await article.save();
      } else {
        // Обработка случая, когда статья не найдена
        return res.status(404).json({ message: "Статья не найдена" }); 
      }
    }

    // Исключаем пароль
    const { hashedPassword, ...userData } = user._doc;

    // Генерируем JWT
    const token = jwt.sign(
      { _id: user._id },
      config.get("jwt_key"),
      { expiresIn: "1h" }
    );

    res.status(200).json({
      userData,
      token,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


export const login = async (req, res) => {
  try {
    const { login, password } = req.body;

    let user = "";

    const validateEmail = (email) => {
      return email.match(
        /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
      );
    };

    if (validateEmail(login)) {
      user = await User.findOne({
        email: login,
      });
      if (!user) {
        return res.status(404).json({
          message: `Қолданушы '${login}' желіде жоқ`,
        });
      }
    } else {
      user = await User.findOne({
        phone: login,
      });
      if (!user) {
        return res.status(404).json({
          message: `Оқушы телефоны: '${login}' желіде жоқ`,
        });
      }
    }

    const isPassValid = await bcrypt.compare(
      password,
      user._doc.hashedPassword
    );

    if (!isPassValid) {
      return res.status(400).json({
        message: "Құпия сөз қате терілген",
      });
    }

    const token = jwt.sign(
      {
        _id: user._id,
      },
      config.get("jwt_key"),
      {
        expiresIn: "1h",
      }
    );

    const { hashedPassword, ...userData } = user._doc;

    res.status(200).json({
      ...userData,
      token,
    });
  } catch (error) {
    res.status(500).json(error.message);
  }
};

export const me = async (req, res) => {
  try {
    const userId = req.userId;

    let user = "";

    if (Boolean(await User.findById(userId))) {
      user = await User.findById(userId)
      .populate("todo")
      .exec();

      const { hashedPassword, ...userData } = user._doc;

      res.status(200).json(userData);
    }

  } catch (error) {
    res.status(500).json(error.message);
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

export const all = async (req, res) => {
  try {
    const users = await User.find().populate("todo").exec();
    res.status(200).json(users);
  } catch (error) {
    res.status(500).json(error.message);
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