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

const deleteNote = async (noteId, userId) => {
 try{
  const note = await prisma.note.findFirst({
    where: {
      id: noteId,
      userId,
    },
  });

  if (!note) {
    const error = new Error("Note not found");
    error.statusCode = 404;
    throw error;
  }

  await prisma.note.delete({
    where: {
      id: noteId,
    },
  });

  logger.info(
    {
      noteId,
      userId,
    },
    "Note deleted successfully"
  );

  return {
    message: "Note deleted successfully",
  };
}
catch (error) {
        if (!error.statusCode) {
            error.statusCode = 500;
        }
        throw error;
    }
};

const updateNote = async (noteId, userId, { title, content }) => {
try{
  const note = await prisma.note.findFirst({
    where: {
      id: noteId,
      userId,
    },
  });

  if (!note) {
    const error = new Error("Note not found");
    error.statusCode = 404;
    throw error;
  }

  const updatedNote = await prisma.note.update({
    where: {
      id: noteId,
    },
    data: {
      title,
      content,
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

  logger.info(
    {
      noteId,
      userId,
    },
    "Note updated successfully"
  );

  return updatedNote;

}catch (error) {
        if (!error.statusCode) {
            error.statusCode = 500;
        }
        throw error;
    }
}

const toggleStar = async (noteId, userId) => {
    try{
  const note = await prisma.note.findFirst({
    where: {
      id: noteId,
      userId,
    },
  });

  if (!note) {
    const error = new Error("Note not found");
    error.statusCode = 404;
    throw error;
  }

  const updatedNote = await prisma.note.update({
    where: {
      id: noteId,
    },
    data: {
      isStarred: !note.isStarred,
    },
    select: {
      id: true,
      title: true,
      isStarred: true,
      updatedAt: true,
    },
  });

  logger.info(
    {
      noteId,
      userId,
      isStarred: updatedNote.isStarred,
    },
    "Note star status updated"
  );

  return updatedNote;}
  catch (error) {
        if (!error.statusCode) {
            error.statusCode = 500;
        }
        throw error;
    }
};

const getNoteById = async (noteId, userId) => {
  try {
    const note = await prisma.note.findFirst({
      where: {
        id: noteId,
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

    if (!note) {
      const error = new Error("Note not found");
      error.statusCode = 404;
      throw error;
    }

    logger.info(
      {
        noteId,
        userId,
      },
      "Retrieved note successfully"
    );

    return note;
  } catch (error) {
    if (!error.statusCode) {
      error.statusCode = 500;
    }
    throw error;
  }
};

const getStarredNotes = async (userId) => {
  try {
    const notes = await prisma.note.findMany({
      where: {
        userId,
        isStarred: true,
      },
      select: {
        id: true,
        title: true,
        content: true,
        isStarred: true,
        createdAt: true,
        updatedAt: true,
      },
      orderBy: {
        updatedAt: "desc",
      },
    });

    logger.info(
      {
        userId,
        count: notes.length,
      },
      "Retrieved starred notes"
    );

    return notes;
  } catch (error) {
    if (!error.statusCode) error.statusCode = 500;
    throw error;
  }
};

const searchNotes = async (userId, query) => {
  try {
    if (!query) {
      const error = new Error("Search query is required");
      error.statusCode = 400;
      throw error;
    }

    const notes = await prisma.note.findMany({
      where: {
        userId,
        OR: [
          {
            title: {
              contains: query,
              mode: "insensitive",
            },
          },
          {
            content: {
              contains: query,
              mode: "insensitive",
            },
          },
        ],
      },
      select: {
        id: true,
        title: true,
        content: true,
        isStarred: true,
        createdAt: true,
        updatedAt: true,
      },
      orderBy: {
        updatedAt: "desc",
      },
    });

    logger.info(
      {
        userId,
        query,
        count: notes.length,
      },
      "Search completed"
    );

    return notes;
  } catch (error) {
    if (!error.statusCode) error.statusCode = 500;
    throw error;
  }
};

module.exports = {
    createNote,getAllNotes,deleteNote,updateNote,toggleStar,getNoteById,getStarredNotes,searchNotes
}
