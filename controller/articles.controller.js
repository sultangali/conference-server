import Article from "../model/Article.js";
import User from "../model/User.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import config from "config";

import {transliterate} from '../service/transliterate.js'

export const all = async (req, res) => {
    try {
      const articles = await Article.find().populate('correspondent').sort({ title: 1 }).exec()
      res.status(200).json(articles)
    } catch (error) {
      res.status(500).json(error.message)
    }
  }

  export const updateArticleStatus = async (req, res) => {
    try {
      const { id } = req.params;
      const { status, comment } = req.body;
 	    console.log(req.userId) 
      // Проверяем, существует ли статья

      const user = await User.findById(req.userId)
      if (!user || user.role !== "moderator") {
	      return res.status(403).json({message: req.t("server.error")});
      }

      const article = await Article.findById(id);
      if (!article) {
        return res.status(404).json({ message: req.t("server.article.notFound") });
      }
  
      // Проверяем, является ли статус допустимым
      const validStatuses = ["approved", "process", "revision", "denied"];
      if (!validStatuses.includes(status)) {
        return res.status(400).json({ message: req.t("server.article.invalidStatus") });
      }
  
      // Обновляем статус статьи
      article.status = status;
      article.comment = comment;
      await article.save();
  
      res.json({ message: req.t("server.article.statusUpdated"), article });
    } catch (error) {
      console.error("Ошибка обновления статуса статьи:", error);
      res.status(500).json({ message: req.t("server.error"), error: error.message });
    }
  };
  

export const getProblems = async (req, res) => {
  try {
    const problems = await Article.find({})
    .populate({
      path: "correspondent",
      select: "lastname firstname fathername participation_type coauthors",
      match: { participation_type: "problem" },
    })
    .select("title section file_url correspondent")
    .then((articles) => articles.filter((article) => article.correspondent)); // Убираем `null`
  
    res.status(200).json(problems);
  } catch (error) {
    console.error("Ошибка получения списка проблем:", error);
    res.status(500).json({ message: req.t("server.error") });
  }
};



const generatePassword = () => {
  const chars = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*";
  let password = "";
  for (let i = 0; i < 8; i++) {
    password += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return password;
};

export const createSolveArticle = async (req, res) => {
  try {
    const { articleTitle, section, correspondentId, problem, fileUrl, coauthors } = req.body;
    
    if (!articleTitle || !section || !correspondentId || !fileUrl) {
      return res.status(400).json({ message: req.t("server.article.allFieldsRequired") });
    }

    // 1️⃣ Создаём статью
    const newArticle = new Article({
      title: articleTitle,
      correspondent: correspondentId,
      problem,
      status: "process",
      file_url: fileUrl,
      section,
    });

    await newArticle.save();

    // 2️⃣ Создаём соавторов
    let createdCoauthors = [];

    const correspondent = await User.findById(correspondentId);
    if (!correspondent) {
      return res.status(404).json({ message: req.t("server.correspondent.notFound") });
    }
    
    if (coauthors && coauthors.length > 0) {
      for (const coauthor of coauthors) {
        const password = generatePassword();
        let login = `${transliterate(coauthor.lastName)}${transliterate(coauthor.firstName[0])}${transliterate(coauthor.fatherName ? coauthor.fatherName[0] : '')}`;
        let index = 1;
        let originalLogin = login;

        while (await User.findOne({ login })) {
          login = `${originalLogin}_${index}`;
          index++;
        }
        const hashedPassword = await bcrypt.hash(password, 10);

        const newCoauthor = new User({
          email: `${login.toLowerCase()}@auto.coauthor.com`,
          login,
          hashedPassword: password,
          lastname: coauthor.lastName,
          firstname: coauthor.firstName,
          fathername: coauthor.fatherName || "",
          organization: coauthor.organization,
          position: coauthor.position,
          degree: coauthor.degree,
          rank: coauthor.rank,
          participation_form: coauthor.participationForm,
          correspondent_data: {
            firstname:  correspondent?.firstname,
            lastname: correspondent?.lastname,
            email: correspondent?.email
          },
          isVerified: true,
          role: "coauthor",
        });

        await newCoauthor.save();

        createdCoauthors.push({
          id: newCoauthor._id,
          email: newCoauthor.email,
          login: login,
          password: password,
          lastname: newCoauthor.lastname,
          firstname: newCoauthor.firstname,
          fathername: newCoauthor.fathername || "",
        organization: newCoauthor.organization,
        position: newCoauthor.position,
        degree: newCoauthor.degree,
        rank: newCoauthor.rank,
        participation_form: newCoauthor.participation_form,
        });
      }
    }

    // 3️⃣ Обновляем данные корреспондента, добавляя соавторов
    await User.findByIdAndUpdate(correspondentId, {
      $push: { coauthors: createdCoauthors.map(({ _id, hashedPassword, ...coauthor }) => coauthor) }
    });

    // 4️⃣ Возвращаем данные
    return res.status(201).json({
      message: req.t("server.article.successfullyCreated"),
      article: newArticle,
      coauthors: createdCoauthors,
    });

  } catch (error) {
    console.error("Ошибка создания статьи:", error);
    return res.status(500).json({ message: req.t("server.error"), error: error.message });
  }
};
