const Post = require("../models/ArticleModel");
const { console } = require("inspector");


// Fonction utilitaire pour gérer les erreurs
const handleError = (res, error, message = "Server Error") => {
  console.error(error);
  res.status(500).send(message);
};

// Constantes pour les chemins 
const ARTICLES_PATH = "/articles";


/* 
* / GET /articles - Home Page Module
*/

module.exports.getArticlePage = async (req, res) => {
  try{
      const perPage = 4;  // number of items per page
      const count = await Post.countDocuments(); // total number of items in the Post collection
      const nbPages = Math.ceil(count / perPage); // total number of pages

      page = parseInt(req.query.page) || 1;

      if (page > nbPages+1 || page < 1) {
        return res.redirect(ARTICLES_PATH);
      }

      const articles = await Post.find()
      .sort([["createdAt", "desc"]])
      .skip((perPage * page) - perPage)
      .limit(perPage)
      .exec();

      res.render("articles/index", {
        title: "Articles",
        articles,
        current: page,
        nbPages: nbPages,
      });

  } catch (error) {
    handleError(res,500)
  }
};

/* 
*  GET  /article/:id   - Single Article Page Module
*/

module.exports.getSingleArticlePage = async (req, res) => {
  try {
    const article = await Post.findOne({ slug: req.params.slug });
    res.render("articles/article", { title: article.title, article });
  } catch (error) {
    handleError(res, 500);
  }
};

/*
*  GET  /search  - Search articles page Module
*/ 

module.exports.getSearchArticlePage = async (req, res) => {

  try {
    if(!req.query.q) {
      return res.redirect(ARTICLES_PATH);
    }
    const search = req.query.q;
    // clean string before search 
    const searchNoSpecialChar = search.replace(/[^a-zA-Z0-9À-ž ]/g, " "); // remove special characters except accented characters

    let articles = await Post.find({ 
      $or : [ 
        { title: { $regex: new RegExp (searchNoSpecialChar, 'i' )} }, 
        { content: { $regex: search, $options: 'i' } } 
      ] 
    });
    if(!articles){
      articles = null;
    }

    res.render("articles/search", { title: "Search", articles, search: search });
  } catch (error) {
    handleError(res,500);
  }
}