import multer from "multer";

const storageService = (path) => {
  const storage = multer.diskStorage({
    destination: (_, __, cb) => {
      cb(null, `upload/${path}`);
    },
    filename: (_, file, cb) => {
      cb(null, file.originalname);
    },
  });
  return storage;
}

export default storageService