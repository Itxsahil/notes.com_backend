import mongoose from "mongoose";

const NoteSchema = new mongoose.Schema(
    {
        branch: {
            type: String,
            required: true,
            enum : ["cs","it","mechanical","electrical","civil"]
        },
        sem: {
            type: Number,
            required: true,
            enum: [1,2,3,4,5,6,7,8]
        },
        subject: {
            type: String,
            required: true,
        },
        title: {
            type: String,
            required: true
        },
        module: {
            type: Number,
            enum: [1,2,3,4,5,6,7,8,],
            required: true
        },
        file: {
            type: String,
            required: true
        },
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        },
    },
    {
        timestamps: true
    }
);

export const Note = mongoose.model('Note', NoteSchema);
