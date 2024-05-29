import { Router } from "express";
import { CustomRequest, isAdminOrManager } from "../middleware";
import { uploadToFileServerAndReturnBackUrl } from "../utils";
import { Note } from "../db";
import { upload } from "../utils/mutterConfig";




const router = Router();

router.get('/hello', (req, res) => {
    console.log('hoooo')
    return res.json({ msg: 'hello from /notes' })
})

router.get('/recent', async (req, res) => {
    try {
        const recentNotes = await Note.find()
            .sort({ createdAt: -1 })
            .limit(10);

        return res.json(recentNotes);
    } catch (error) {
        console.log(error);
        return res.status(500).json({ msg: 'some internal server error' });
    }
})

router.post('/filter', async (req, res) => {
    const { semester, section, subject, module } = req.body;

    try {
        const notes = await Note.find({ semester, section, subject, module })
        return res.json(notes);
    } catch (err) {
        console.log(err);
        return res.status(500).json({ msg: 'internal server error' })
    }
})

router.post('/add', isAdminOrManager,upload.single('file'), async (req:CustomRequest, res) => {
    console.log('i am here')
    const { title, semester, section, subject, module } = req.body;

    const file = req.file;

    // Handle the uploaded file
    if (!file) {
        return res.status(400).send('No file uploaded');
    }

    



    // if (!title || !fileUrl || !semester || !section || !subject || !module) {
    //     return res.status(400).json({ msg: 'please provide valid title and fileUrl' })
    // }
    console.log(req.authData)
    try {

        const fileUrlFromStore = await uploadToFileServerAndReturnBackUrl(file.buffer, title);

        const newNote = new Note({
            title: title,
            author: req.authData?.userId,
            fileUrl: fileUrlFromStore,
            semester,
            section,
            subject,
            module
        })
        const note = await newNote.save();
        console.log(note);
        return res.json(note);
    } catch (err) {
        console.log(err);
        return res.status(500).json({ msg: 'some internal server error' });
    }
})

export default router;