const notesServices = require("../services/notes.service");

const postNote = async (req, res, next) => {
  try {
    //here we use destructuring of req.body
    const result = await notesServices.createNote({
      ...req.body,
      userId: req.user.id,
    });

    return res.status(201).json({
      success: true,
      message: "note created successfully",
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

const getAllNotes = async (req, res, next) => {
  try {
    const result = await notesServices.getAllNotes(req.user.id);
    return res.status(200).json({
      success: true,
      message: "notes fetched successfully",
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  postNote,
  getAllNotes,
};