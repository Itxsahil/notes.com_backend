import { Router } from 'express';
import { verifyJWT } from '../middlewares/auth.js'
import {
    verifyAdmin,
    verifyManagerorAdmin,
} from '../middlewares/userStatus.js'
import { upload } from '../middlewares/multer.js';
import { uploadNote, getNotes,  deleteNotes } from '../controllers/notesController.js'

const router = Router();

router.route('/upload').post(verifyJWT,verifyManagerorAdmin,upload.single("file"), uploadNote)
router.route('/getNotes').get(getNotes)
router.route('/deleteNote/:noteId').post(verifyJWT,verifyManagerorAdmin,deleteNotes)


export default router;
