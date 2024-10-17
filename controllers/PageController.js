const Post = require("../models/ArticleModel");
const fs = require("fs");
const path = require("path");

// Fonction utilitaire pour gérer les erreurs
const handleError = (res, error, message = "Server Error") => {
  console.error(error);
  res.status(500).send(message);
};

/* Home Page Module 
 */
module.exports.getHomePage = async (req, res) => {
    try {
        const articles = await Post.find().sort([["createdAt", "desc"]]).limit(3).exec();
        res.render("homepage/index", { title: "Home", articles });
    } catch (error) {
        handleError(res, 500);
    }
}

/* About Page Module 
 */
module.exports.getAboutPage = (req, res) => {
    res.render("homepage/about", { title: "About" });
}

/* 404 Page Module 
*/
module.exports.get404Page = (req, res) => {
    res.render("errors/404", { title: "404 Not Found" });
}


