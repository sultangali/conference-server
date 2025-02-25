import Article from "../model/Article.js"
import User from "../model/User.js"
import moment from "moment"
import fs from 'fs'
import path from "path";
import { transliterate } from "../service/transliterate.js";
export const uploadAvatar = async (req, res) => {

    const url = `/upload/users/${req.file.originalname}`

    await User.updateOne({
        _id: req.userId
    }, {
        avatar: url
    })
    res.json({
        url: url
    })
}


export const uploadProblemArticle = async (req, res) => {
  try {
    if (!req.files || !req.files.file) {
      return res.status(400).json({ message: req.t("server.upload.noFile") });
    }

    const section = req.body.section || "unknown_section";
    const correspondentName = req.body.correspondentName || "unknown_correspondent";
    const file = req.files.file[0];

    // Генерируем новое имя файла
    const formattedDate = moment().format("DDMMYY_HHmmss");
    const cleanName = transliterate(correspondentName?.replace(/\s+/g, "_"))?.toUpperCase();
    const cleanSection = "SEC" + section?.substring(8, 9);
    const fileExt = path.extname(file.originalname);
    const newFilename = `${cleanSection}_${cleanName}_${formattedDate}${fileExt}`;

    // Новый путь
    const newPath = path.join("upload/articles/problem/", newFilename);

    // Переименовываем файл
    fs.renameSync(file.path, newPath);

    console.log("✅ Файл успешно загружен:", {
      section,
      correspondentName,
      filename: newFilename,
    });

    const fileUrl = `/upload/articles/problem/${newFilename}`;

    res.json({
      message: req.t("server.upload.successFile"),
      url: fileUrl,
      filename: newFilename,
    });
  } catch (error) {
    console.error("Ошибка загрузки файла:", error);
    res.status(500).json({ message:  req.t("server.error"), error: error.message });
  }
};



export const uploadSolveArticle = async (req, res) => {
  try {
    if (!req.files || !req.files.file) {
      return res.status(400).json({ message: req.t("server.upload.noFile") });
    }

    const section = req.body.section || "unknown_section";
    const problem = req.body.problem || "unknown_problem";
    const correspondentName = req.body.correspondentName || "unknown_correspondent";
    const file = req.files.file[0];

    // Генерируем новое имя файла
    const formattedDate = moment().format("DDMMYY_HHmmss");
    const cleanName = transliterate(correspondentName?.replace(/\s+/g, "_"))?.toUpperCase();
    const cleanSection = "SEC" + section?.substring(8, 9);
    const fileExt = path.extname(file.originalname);
    const newFilename = `${cleanSection}_${cleanName}_${formattedDate}${fileExt}`;

    // Новый путь
    const newPath = path.join("upload/articles/solve/", newFilename);

    // Переименовываем файл
    fs.renameSync(file.path, newPath);  

    const fileUrl = `/upload/articles/solve/${newFilename}`;

    res.json({
      message: req.t("server.upload.successFile"),
      url: fileUrl,
      filename: newFilename,
    });
  } catch (error) {
    console.error(req.t("server.upload.errorFile"), error);
    res.status(500).json({ message: req.t("server.error"), error: error.message });
  }
};
