import { Note } from "../models/Note.js"
import { asyncHandler } from "../utils/asyncHandler.js"
import { uploadToFileServerAndReturnBackUrl } from "../utils/discord.js";

const uploadNote = asyncHandler(async(req, res) => {
    const { branch, sem, subject, title, module } = req.body;
    const fileLocalPath = req.file?.path
    if(!branch) return res.json({message : "branch required"})
    if(!sem) return res.json({message : "sem required"})
    if(!title) return res.json({message : "title required"})
    if(!module) return res.json({message : "module required"})
    if(!subject) return res.json({message : "subject required"})
    if(!fileLocalPath) return res.json({message : "file required"})
    
    const fileUrl = await uploadToFileServerAndReturnBackUrl(fileLocalPath,title)
    try {
        const note = new Note({
            branch,
            sem,
            subject :subject.toLowerCase(),
            title: title.toLowerCase(),
            module,
            file: fileUrl.toString(),
            user: req.user.id,
        });

        await note.save();
        // await discord.sendNotification(`New note uploaded: ${title}`);
        res.status(201).json(note);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
});

const getNotes = asyncHandler(async (req, res) => {
    let { branch, sem, subject, module } = req.query;
    console.log(branch, sem, subject, module)
    let page = parseInt(req.query.page) || 1;
    const pageSize = 10;

    let query = {};

    // Check if any query parameters are provided
    if (branch || sem || subject || module) {
        query = { branch, sem, subject, module };
    } else {
        // If no query parameters are provided, fetch recently uploaded notes
        query = {}; // Fetch all notes
    }

    // Calculate the total count of notes
    const totalNotes = await Note.countDocuments(query);

    // Calculate the total number of pages
    const totalPages = Math.ceil(totalNotes / pageSize);

    // Fetch notes for the current page
    const notes = await Note.find(query)
        .sort({ createdAt: -1 })
        .skip((page - 1) * pageSize)
        .limit(pageSize);

    // Prepare the response
    res.json({
        notes,
        currentPage: page,
        totalPages,
        hasMore: page < totalPages
    });
});

const deleteNotes = asyncHandler(async(req, res)=>{
    const {noteId} = req.params
    if(!noteId) return res.json({message: "please provide the file ID"})
    await Note.findByIdAndDelete(noteId)
    return res.status(200).json({message : "file deleted sucessfully"})
})
export {
    uploadNote,
    getNotes,
    deleteNotes
}