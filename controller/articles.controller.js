import mongoose from "mongoose";
import Article from "../model/Article.js";

export const all = async (req, res) => {
    try {
      const articles = await Article.find().populate('authors').exec()
      res.status(200).json(articles)
    } catch (error) {
      res.status(500).json(error.message)
    }
  }

export const one = async (req, res) => {
    try {
        const { code } = req.body
      const article = await Article.findOne({ code }).populate('authors')
      res.status(200).json({
        found: true,
        title: article.title,
        author: article.authors[0],
        file_url: article.file_url,
        section: article.section
      })
    } catch (error) {
      res.status(500).json(error.message)
    }
}
  