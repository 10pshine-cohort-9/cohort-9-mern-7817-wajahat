const express = require("express");
const router = express.Router();
const authenticater=require('../middlewares/auth')
const noteController=require('../controllers/notesController')

router.post('/',authenticater,noteController.postNote);
router.get('/',authenticater,noteController.getAllNotes);
router.patch("/:id", authenticater, noteController.updateNote);
router.delete("/:id", authenticater, noteController.deleteNote);
router.patch("/:id/star", authenticater, noteController.toggleStar);
router.get("/:id", authenticater, noteController.getNoteById);
router.get("/starred", authenticater, noteController.getStarredNotes);
router.get("/search", authenticate, noteController.searchNotes);

module.exports=router;