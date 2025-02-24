import multer from "multer";
import path  from "path";
import moment from "moment"; // 👈 Для генерации даты
import fs from "fs";

const storageService = (filePath) => {
  const storage = multer.diskStorage({
    destination: (_, __, cb) => {
      cb(null, `upload/${filePath}`);
    },
    filename: (_, file, cb) => {
      // Временно сохраняем файл с именем temp_
      const formattedDate = moment().format("DDMMYY_HHmmss");
      const fileExt = path.extname(file.originalname);
      cb(null, `temp_${formattedDate}${fileExt}`);
    },
  });

  return storage;
};

export default storageService;
