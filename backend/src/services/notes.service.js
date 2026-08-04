const prisma = require('../config/prisma')
const logger = require('../config/logger');
const { count } = require('node:console');

const createNote = async ({ title, content, userId }) => {
    try {
        if (!title || !content) {
            const error = new Error("Title and content are required");
            error.statusCode = 400;
            throw error;
        }
        const noteCreated = await prisma.note.create({
            data: {
                title,
                content,
                userId,
            },
            select: {
                id: true,
                title: true,
                content: true,
                isStarred: true,
                createdAt: true,
                updatedAt: true,
            },
        });
        logger.info({
            noteId: noteCreated.id,
            userId
        }, "note created successfully");
        return noteCreated;
    }
    catch (error) {
        if (!error.statusCode) {
            error.statusCode = 500;
        }
        throw error;
    }
}

const getAllNotes = async (userId) => {
    try {
        const notes = await prisma.note.findMany({
            where: {
                userId,
            },
            select: {
                id: true,
                title: true,
                content: true,
                isStarred: true,
                createdAt: true,
                updatedAt: true,
            }
        });
        logger.info(
            {
                userId,count:notes.length
            },
            "Retrieved all notes of this user "
        );

        return notes
    } catch (error) {
        if (!error.statusCode) {
            error.statusCode = 500;
        }
        throw error;
    }
}

module.exports = {
    createNote,getAllNotes
}
