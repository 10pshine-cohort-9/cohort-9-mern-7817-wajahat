import "@testing-library/jest-dom";
import api from "../api/axios";
import {
  createNote,
  getAllNotes,
  getNoteById,
  updateNote,
  deleteNote,
  updateStarStatus,
  getStarredNotes,
  searchNotes,
} from "../services/notesService";

jest.mock("../api/axios");

describe("notesService", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.spyOn(console, "error").mockImplementation(() => {});
  });

  afterEach(() => {
    console.error.mockRestore();
  });

  it("createNote posts note data to /notes", async () => {
    const noteData = { title: "Test", content: "<p>hi</p>" };
    api.post.mockResolvedValue({ data: { data: noteData } });

    const response = await createNote(noteData);

    expect(api.post).toHaveBeenCalledWith("/notes", noteData);
    expect(response.data.data).toEqual(noteData);
  });

  it("getAllNotes fetches from /notes", async () => {
    api.get.mockResolvedValue({ data: { data: [] } });

    await getAllNotes();

    expect(api.get).toHaveBeenCalledWith("/notes");
  });

  it("getNoteById fetches a single note by id", async () => {
    api.get.mockResolvedValue({ data: { data: { id: "42" } } });

    await getNoteById("42");

    expect(api.get).toHaveBeenCalledWith("/notes/42");
  });

  it("updateNote sends a PATCH with the updated fields", async () => {
    const updates = { title: "Updated title" };
    api.patch.mockResolvedValue({ data: { data: updates } });

    await updateNote("42", updates);

    expect(api.patch).toHaveBeenCalledWith("/notes/42", updates);
  });

  it("deleteNote sends a DELETE for the given id", async () => {
    api.delete.mockResolvedValue({ data: { message: "deleted" } });

    await deleteNote("42");

    expect(api.delete).toHaveBeenCalledWith("/notes/42");
  });

  it("updateStarStatus patches the star endpoint with isStarred", async () => {
    api.patch.mockResolvedValue({ data: { data: { isStarred: true } } });

    await updateStarStatus("42", true);

    expect(api.patch).toHaveBeenCalledWith("/notes/42/star", {
      isStarred: true,
    });
  });

  it("getStarredNotes fetches from /notes/starred", async () => {
    api.get.mockResolvedValue({ data: { data: [] } });

    await getStarredNotes();

    expect(api.get).toHaveBeenCalledWith("/notes/starred");
  });

  it("searchNotes fetches /notes/search with the query param", async () => {
    api.get.mockResolvedValue({ data: { data: [] } });

    await searchNotes("todo");

    expect(api.get).toHaveBeenCalledWith("/notes/search", {
      params: { q: "todo" },
    });
  });

  it("logs and re-throws when the underlying request fails", async () => {
    const error = new Error("Request failed");
    api.get.mockRejectedValue(error);

    await expect(getAllNotes()).rejects.toThrow("Request failed");
    expect(console.error).toHaveBeenCalledWith(
      "Notes API request failed:",
      error
    );
  });
});