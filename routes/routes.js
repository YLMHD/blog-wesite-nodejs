const express = require("express"); // Import express
const router = express.Router(); // Make a router
const upload = require("../config/fileUpload"); // Import the multer configuration

const {
  getHomePage,
  getAboutPage,
  get404Page,
} = require("../controllers/PageController"); // Import the controller methods

const {
  getArticlePage,
  getSingleArticlePage,
  getSearchArticlePage,
} = require("../controllers/ArticleController");

const {
  getAdminPage,
  postLogin,
  postRegister,
  getLogout,
  isAuthenticated,
  getDashboardPage,
  getNewArticlePage,
  postNewArticle,
  getEditArticlePage,
  postEditArticle,
  postEditImageArticle,
  getDeleteArticle,

} = require("../controllers/AdminController");

/** Routes for the application **/

// Home Route
router.get("/", getHomePage);

// Article Route
router.get("/articles", getArticlePage);

// Single Article Route
router.get("/article/:slug", getSingleArticlePage);

// Search Article Route
router.get("/search", getSearchArticlePage);

// About Route
router.get("/about", getAboutPage);

/*************************** Administartion Routes *****************************/

// Admin Home Route
router.get("/admin", getAdminPage);

// Login Route
router.post("/login", postLogin);

// Logout Route
router.get("/logout", getLogout);

// Register Route
router.post("/register", postRegister);


// Dashboard Route
router.get("/admin/dashboard", isAuthenticated, getDashboardPage);

// Add Article Route

router.get("/admin/dashboard/new-article", isAuthenticated, getNewArticlePage);
router.post(  "/admin/dashboard/new-article", isAuthenticated,  postNewArticle
);

// Edit Article Route
router.get("/admin/dashboard/edit-article/:id", isAuthenticated, getEditArticlePage);
router.post("/admin/dashboard/edit-article/:id", isAuthenticated, postEditArticle);
// Edit Image Article Route
router.post("/admin/dashboard/edit-article-image/:id", isAuthenticated, postEditImageArticle);

// Delete Article Route
router.get("/admin/dashboard/delete-article/:id", isAuthenticated, getDeleteArticle);



router.post("/admin/dashboard", isAuthenticated, getDashboardPage);

/*************************** Error Routes *****************************/

// 404 Route
router.get("*", get404Page);

// Export the router
module.exports = router;
