import api from "../api/axios";

/**
 * Create a new note
 * @param {Object} noteData
 * @returns {Promise<Object>}
 */
export const createNote = async (noteData) => {
  return await api.post("/notes", noteData);
};

/**
 * Get all notes for the logged-in user
 * @returns {Promise<Object>}
 */
export const getAllNotes = async () => {
  return await api.get("/notes");
};

/**
 * Get a single note
 * @param {string} noteId
 * @returns {Promise<Object>}
 */
export const getNoteById = async (noteId) => {
  return await api.get(`/notes/${noteId}`);
};

/**
 * Update a note
 * @param {string} noteId
 * @param {Object} noteData
 * @returns {Promise<Object>}
 */
export const updateNote = async (noteId, noteData) => {
  return await api.patch(`/notes/${noteId}`, noteData);
};

/**
 * Delete a note
 * @param {string} noteId
 * @returns {Promise<Object>}
 */
export const deleteNote = async (noteId) => {
  return await api.delete(`/notes/${noteId}`);
};

/**
 * Star or unstar a note
 * @param {string} noteId
 * @param {boolean} isStarred
 * @returns {Promise<Object>}
 */
export const updateStarStatus = async (noteId, isStarred) => {
  return await api.patch(`/notes/${noteId}/star`, {
    isStarred,
  });
};

/**
 * Get all starred notes
 * @returns {Promise<Object>}
 */
export const getStarredNotes = async () => {
  return await api.get("/notes/starred");
};

/**
 * Search notes
 * @param {string} query
 * @returns {Promise<Object>}
 */
export const searchNotes = async (query) => {
  return await api.get("/notes/search", {
    params: {
      q: query,
    },
  });
};