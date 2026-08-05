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

const deleteNote = async (req, res, next) => {
  try {
    const result = await notesService.deleteNote(
      req.params.id,
      req.user.id
    );

    return res.status(200).json({
      success: true,
      message: result.message,
    });
  } catch (error) {
    next(error);
  }
};

const updateNote = async (req, res, next) => {
  try {
    const result = await notesService.updateNote(
      req.params.id,
      req.user.id,
      req.body
    );

    return res.status(200).json({
      success: true,
      message: "Note updated successfully",
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

const toggleStar = async (req, res, next) => {
  try {
    const result = await notesService.toggleStar(
      req.params.id,
      req.user.id
    );

    return res.status(200).json({
      success: true,
      message: "Star status updated",
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

const getNoteById = async (req, res, next) => {
  try {
    const result = await notesServices.getNoteById(
      req.params.id,
      req.user.id
    );

    return res.status(200).json({
      success: true,
      message: "Note fetched successfully",
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

const getStarredNotes = async (req, res, next) => {
  try {
    const result = await notesServices.getStarredNotes(req.user.id);

    return res.status(200).json({
      success: true,
      message: "Starred notes fetched successfully",
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

const searchNotes = async (req, res, next) => {
  try {
    const result = await notesServices.searchNotes(
      req.user.id,
      req.query.q
    );

    return res.status(200).json({
      success: true,
      message: "Search completed successfully",
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  postNote,
  getAllNotes,
  deleteNote,
  updateNote,
  toggleStar,
  getNoteById,
  getStarredNotes,searchNotes
};