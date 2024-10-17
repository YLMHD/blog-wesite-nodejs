const Contact = require("../models/ContactModel");
const fs = require("fs");
const path = require("path");

// Fonction utilitaire pour définir les messages de session
const setSessionMessage = (req, type, message) => {
  req.session.message = { type, message };
};

/**
 * Module who get all contacts and render it in the view
 */
module.exports.getContacts = async (req, res) => {
  try {
    const contacts = await Contact.find();

    res.render("contact/index", { title: "Contacts", contacts });
  } catch (error) {
    res.status(500).send("Server Error");
  }
};
/**
 * Module who return a specific contact information and render it in the view
 */

module.exports.getContact = async (req, res) => {
  try {
    const contact = await Contact.findById(req.params.id);
    res.render("contact/show_contact", { title: "Show contact",  contact });
  } catch (error) {
    res.status(500).send("Server Error");
  }
};
/**
 * Module who add a contact
 */
module.exports.addContact = async (req, res) => {
  let image = req.file !== undefined ? req.file.filename : null;
  try {
    const contact = new Contact({
      name: req.body.name,
      email: req.body.email,
      phone: req.body.phone,
      image: image,
    });
    await contact.save();
    setSessionMessage(req, "success", "Contact added successfully");
    res.redirect("/");
  } catch (error) {
    setSessionMessage(req, "danger", "Contact not added");
    res.status(500).redirect("/");
  }
};

/**
 * Module who display a specific contact information in update form
 */
module.exports.updateContactForm = async (req, res) => {
  try {
    const contact = await Contact.findById(req.params.id);
    res.render("contact/update_contact", { title: "Update contact", contact });
  } catch (error) {
    res.status(404).send("/");
  }
};

/**
 * Module who update a contact informations
 */

module.exports.updateContact = async (req, res) => {
  try {
    const contact = await Contact.findById(req.params.id);

    contact.name = req.body.name;
    contact.email = req.body.email;
    contact.phone = req.body.phone;
    await contact.save();
    setSessionMessage(req, "success", "Contact updated successfully");
    res.redirect("/");
  } catch (error) {
    setSessionMessage(req, "danger", "Contact not updated");
    res.status(500).redirect("/");
  }
};

/**
 * Module who update a contact avatar
 */

module.exports.updateContactAvatar = async (req, res) => {
  try {
    const contact = await Contact.findById(req.params.id);
    if (contact.image) {
      fs.unlinkSync(path.join(__dirname, `../public/uploads/${contact.image}`));
    }
    contact.image = req.file.filename;
    await contact.save();
    setSessionMessage(req, "success", "Contact image updated successfully");
    res.redirect("/");
  } catch (error) {
    setSessionMessage(req, "danger", "Contact image not updated");
    res.status(500).redirect("/");
  }
};

/**
 * Module who delete a contact and his avatar
 */

module.exports.deleteContact = async (req, res) => {
  if (!req.params.id) {
    req.session.message = {
      type: "danger",
      message: "Contact not found",
    };
  }
  try {
    const contact = await Contact.findByIdAndDelete(req.params.id);
    fs.unlinkSync(path.join(__dirname, `../public/uploads/${contact.image}`));
    setSessionMessage(req, "success", "Contact deleted successfully");
    res.redirect("/");
  } catch (error) {
    setSessionMessage(req, "danger", "Contact not deleted");
    res.status(500).redirect("/");
  }
};
