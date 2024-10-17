const Article = require("../models/ArticleModel");
const User = require("../models/UserModel");
const fs = require("fs");
const path = require("path");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");


// Fonction utilitaire pour gérer les erreurs
const handleError = (res, error, message = "Server Error") => {
  console.error(error);
  res.status(500).send(message);
};

// Fonction utilitaire pour définir les messages de session
const setSessionMessage = (req, type, message) => {
  req.session.message = { type, message };
};

// Fonction utilitaire pour rediriger avec message de session
const redirectWithMessage = (req, res, path, type, message) => {
  setSessionMessage(req, type, message);
  res.redirect(path);
};

// Constantes pour les chemins de vue
const ADMIN_LAYOUT = "layouts/admin";
const ADMIN_PATH = "/admin";
const DASHBOARD_PATH = "/admin/dashboard";

/**
 * GET /admin
 */
module.exports.getAdminPage = async (req, res) => {
  try {
    if (req.cookies.token) {
      return res.redirect(DASHBOARD_PATH);
    }
    res.render("admin/index", {
        title: "Admin",
        authenticated: false,
        layout: ADMIN_LAYOUT,
      });
  } catch (error) {
    handleError(res, error);
  }
};

/**
 * GET /dashboard
 */
module.exports.getDashboardPage = async (req, res) => {
  try {
    const perPage = 4; // number of items per page
    const count = await Article.countDocuments(); // total number of items in the Article collection
    const nbPages = Math.ceil(count / perPage); // total number of pages

    page = parseInt(req.query.page) || 1;

    if (page > nbPages + 1 || page < 1) {
      return res.redirect("/admin/dashboard");
    }

    const articles = await Article.find()
      .sort([["createdAt", "desc"]])
      .skip(perPage * page - perPage)
      .limit(perPage)
      .exec();

    res.render("admin/dashboard", {
      title: "Dashboard",
      authenticated: true,
      articles,
      current: page,
      nbPages: nbPages,
      layout: ADMIN_LAYOUT,
    });
  } catch (error) {
    handleError(res, error);
  }
};

/**
 * POST /login
 */
module.exports.postLogin = async (req, res) => {
  try {
    const { username, password } = req.body;
    const user = await User.findOne({ username });

    if (!user || !(await bcrypt.compare(password, user.password))) {
      return redirectWithMessage(
        req,
        res,
        ADMIN_PATH,
        "danger",
        "Invalid credentials"
      );
    }

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: process.env.JWT_EXPIRE,
    });
    res.cookie("token", token, { httpOnly: true });
    res.redirect(DASHBOARD_PATH);
  } catch (error) {
    handleError(res, error);
  }
};

/**
 * POST /register
 */
module.exports.postRegister = async (req, res) => {
  try {
    const { username, password } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);

    const user = new User({ username, password: hashedPassword });
    await user.save();
    redirectWithMessage(
      req,
      res,
      ADMIN_PATH,
      "success",
      "User created successfully"
    );
  } catch (error) {
    if (error.code === 11000) {
      return redirectWithMessage(
        req,
        res,
        ADMIN_PATH,
        "danger",
        "Username already exists"
      );
    }
    handleError(res, error);
  }
};

/**
 * GET /logout
 */
module.exports.getLogout = async (req, res) => {
  res.clearCookie("token");
  res.redirect(ADMIN_PATH);
};

/**
 * GET /admin/dashboard/new-article
 */

module.exports.getNewArticlePage = async (req, res) => {
  try {
    res.render("admin/new_article", {
      title: "New Article",
      authenticated: true,
      layout: ADMIN_LAYOUT,
    });
  } catch (error) {
    handleError(res, error);
  }
};

/**
 * POST /admin/dashboard/new-article
 */

module.exports.postNewArticle = async (req, res) => {
  try {
    const titleToSlug = req.body.title
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .toLowerCase()
      .replace(/[^a-zA-Z0-9]+/g, "-");  

    const article = new Article({
      title: req.body.title,
      content: req.body.content,
      slug: titleToSlug,
      author: "Admin",
      image: "https://placehold.co/600x400",
    });

    console.log(article);

   await article.save();
    redirectWithMessage(
      req,
      res,
      DASHBOARD_PATH,
      "success",
      "Article added successfully"
    );
  } catch (error) {
    handleError(res, error);
  }
}

/**
 * GET /admin/dashboard/edit-article/:id
 */

module.exports.getEditArticlePage = async (req, res) => {
  try {
    const article = await Article.findById(req.params.id);
    res.render("admin/edit_article", {
      title: "Edit Article",
      authenticated: true,
      article,
      layout: ADMIN_LAYOUT,
    });
  } catch (error) {
    handleError(res, error);
  }
}

/* 
* POST /admin/dashboard/edit-article/:id
*/

module.exports.postEditArticle = async (req, res) => {
  try {
    await Article.findByIdAndUpdate(req.params.id, req.body);
    redirectWithMessage(
      req,
      res,
      DASHBOARD_PATH,
      "success",
      "Article updated successfully"
    );
  } catch (error) {
    handleError(res, error);
  }
}; 

/**
 * GET /admin/dashboard/delete-article/:id
 */

module.exports.getDeleteArticle = async (req, res) => {
  try {
    const article = await Article.findById(req.params.id);
    const imagePath = path.join(__dirname, "..", "public", article.image);
    if(fs.existsSync(imagePath)){
      fs.unlinkSync(imagePath);
    }
    await Article.findByIdAndDelete(req.params.id);
    redirectWithMessage(
      req,
      res,
      DASHBOARD_PATH,
      "success",
      "Article deleted successfully"
    );
  } catch (error) {
    handleError(res, error);
  }
};

/*
* POST /admin/dashboard/edit-image-article/:id
*/

module.exports.postEditImageArticle = async (req, res) => {};

/**
 * Middleware for checking if user is authenticated
 */
module.exports.isAuthenticated = async (req, res, next) => {
  const token = req.cookies.token;

  if (!token) {
    return redirectWithMessage(
      req,
      res,
      ADMIN_PATH,
      "danger",
      "Please login to access this page"
    );
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = await User.findById(decoded.id);
    next();
  } catch (error) {
    redirectWithMessage(
      req,
      res,
      ADMIN_PATH,
      "danger",
      "Please login to access this page"
    );
  }
};
