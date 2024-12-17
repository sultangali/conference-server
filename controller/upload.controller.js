import Article from "../model/Article.js"
import User from "../model/User.js"

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

export const uploadArticle = async (req, res) => {
    try {
      const url = `/upload/articles/${req.file.originalname}`;
      const section = req.body.section
      console.log(section)
      const existingArticle = await Article.findOne({
        $or: [{ title: req.body.title }, { code: req.body.code }],
      });
  
      if (existingArticle) {
        // Обновляем существующую статью
        existingArticle.file_url = url; // Обновляем URL файла
        // Добавьте другие поля для обновления при необходимости
        await existingArticle.save();
  
        res.json({
          message: "Статья обновлена",
          article: existingArticle, // Можно вернуть обновленную статью
        });
      } else {
        // Создаем новую статью
        
        if (req.body.section == "") {
          return res.json({ // Добавляем return
            message: "Вы забыли указать секцию",
          }); 
        }
        const article = new Article({
          title: req.body.title,
          code: req.body.code,
          section: req.body.section,
          file_url: url,
        });
  
        await article.save();
  
        res.json({
          message: "Статья создана",
          article: article, // Можно вернуть созданную статью
        });
      }
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  };