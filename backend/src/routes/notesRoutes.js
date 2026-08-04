const express = require("express");
const router = express.Router();
const authenticater=require('../middlewares/auth')
const noteController=require('../controllers/notesController')

router.post('/',authenticater,noteController.postNote);
router.get('/',authenticater,noteController.getAllNotes);

module.exports=router;