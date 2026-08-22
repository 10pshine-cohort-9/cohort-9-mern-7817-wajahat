require("dotenv").config();

const { expect } = require("chai");
const sinon = require("sinon");

const notesService = require("../../services/notes.service");
const notesController = require("../../controllers/notesController");

describe("notesController", () => {
  let req, res, next;
  const userId = "user-1";

  beforeEach(() => {
    req = { body: {}, params: {}, query: {}, user: { id: userId } };
    res = {
      status: sinon.stub().returnsThis(),
      json: sinon.stub().returnsThis(),
    };
    next = sinon.stub();
  });

  afterEach(() => {
    sinon.restore();
  });
//new note creation
  describe("postNote()", () => {
    it("should respond 201 with the created note on success", async () => {
      req.body = { title: "Test", content: "Body" };
      const serviceResult = { id: "note-1", title: "Test", content: "Body" };
      sinon.stub(notesService, "createNote").resolves(serviceResult);

      await notesController.postNote(req, res, next);

      sinon.assert.calledOnceWithMatch(notesService.createNote, {
        title: "Test",
        content: "Body",
        userId,
      });
      sinon.assert.calledOnceWithExactly(res.status, 201);
      sinon.assert.calledOnceWithMatch(res.json, {
        success: true,
        message: "note created successfully",
        data: serviceResult,
      });
      sinon.assert.notCalled(next);
    });

    it("should attach req.user.id as userId even if body sends a different one", async () => {
      req.body = { title: "Test", content: "Body", userId: "someone-else" };
      sinon.stub(notesService, "createNote").resolves({ id: "note-1" });

      await notesController.postNote(req, res, next);

      const callArgs = notesService.createNote.firstCall.args[0];
      expect(callArgs.userId).to.equal(userId);
    });

    it("should call next(error) when createNote throws", async () => {
      const error = new Error("Title and content are required");
      error.statusCode = 400;
      sinon.stub(notesService, "createNote").rejects(error);

      await notesController.postNote(req, res, next);

      sinon.assert.calledOnceWithExactly(next, error);
      sinon.assert.notCalled(res.status);
    });
  });
//get all notes
  describe("getAllNotes()", () => {
    it("should respond 200 with the user's notes on success", async () => {
      const notes = [{ id: "note-1" }, { id: "note-2" }];
      sinon.stub(notesService, "getAllNotes").resolves(notes);

      await notesController.getAllNotes(req, res, next);

      sinon.assert.calledOnceWithExactly(notesService.getAllNotes, userId);
      sinon.assert.calledOnceWithExactly(res.status, 200);
      sinon.assert.calledOnceWithMatch(res.json, {
        success: true,
        message: "notes fetched successfully",
        data: notes,
      });
    });

    it("should call next(error) when getAllNotes throws", async () => {
      const error = new Error("Connection lost");
      sinon.stub(notesService, "getAllNotes").rejects(error);

      await notesController.getAllNotes(req, res, next);

      sinon.assert.calledOnceWithExactly(next, error);
    });
  });
//get one note by id
  describe("getNoteById()", () => {
    it("should respond 200 with the note on success", async () => {
      req.params.id = "note-1";
      const note = { id: "note-1", title: "Test" };
      sinon.stub(notesService, "getNoteById").resolves(note);

      await notesController.getNoteById(req, res, next);

      sinon.assert.calledOnceWithExactly(notesService.getNoteById, "note-1", userId);
      sinon.assert.calledOnceWithExactly(res.status, 200);
      sinon.assert.calledOnceWithMatch(res.json, {
        success: true,
        message: "Note fetched successfully",
        data: note,
      });
    });

    it("should call next(error) with 404 when the note is not found", async () => {
      req.params.id = "bad-id";
      const error = new Error("Note not found");
      error.statusCode = 404;
      sinon.stub(notesService, "getNoteById").rejects(error);

      await notesController.getNoteById(req, res, next);

      sinon.assert.calledOnceWithExactly(next, error);
      sinon.assert.notCalled(res.status);
    });
  });
//update note
  describe("updateNote()", () => {
    it("should respond 200 with the updated note on success", async () => {
      req.params.id = "note-1";
      req.body = { title: "Updated", content: "New body" };
      const updatedNote = { id: "note-1", title: "Updated", content: "New body" };
      sinon.stub(notesService, "updateNote").resolves(updatedNote);

      await notesController.updateNote(req, res, next);

      sinon.assert.calledOnceWithExactly(
        notesService.updateNote,
        "note-1",
        userId,
        req.body
      );
      sinon.assert.calledOnceWithExactly(res.status, 200);
      sinon.assert.calledOnceWithMatch(res.json, {
        success: true,
        message: "Note updated successfully",
        data: updatedNote,
      });
    });

    it("should call next(error) with 404 when the note is not found", async () => {
      req.params.id = "bad-id";
      const error = new Error("Note not found");
      error.statusCode = 404;
      sinon.stub(notesService, "updateNote").rejects(error);

      await notesController.updateNote(req, res, next);

      sinon.assert.calledOnceWithExactly(next, error);
    });
  });
  //delete node
  describe("deleteNote()", () => {
    it("should respond 200 with the service message on success", async () => {
      req.params.id = "note-1";
      sinon.stub(notesService, "deleteNote").resolves({ message: "Note deleted successfully" });

      await notesController.deleteNote(req, res, next);

      sinon.assert.calledOnceWithExactly(notesService.deleteNote, "note-1", userId);
      sinon.assert.calledOnceWithExactly(res.status, 200);
      sinon.assert.calledOnceWithMatch(res.json, {
        success: true,
        message: "Note deleted successfully",
      });
    });

    it("should call next(error) with 404 when the note is not found", async () => {
      req.params.id = "bad-id";
      const error = new Error("Note not found");
      error.statusCode = 404;
      sinon.stub(notesService, "deleteNote").rejects(error);

      await notesController.deleteNote(req, res, next);

      sinon.assert.calledOnceWithExactly(next, error);
    });
  });
//update stars
  describe("updateStarStatus()", () => {
    it('should respond with "starred" message when isStarred is true', async () => {
      req.params.id = "note-1";
      req.body = { isStarred: true };
      const updatedNote = { id: "note-1", isStarred: true };
      sinon.stub(notesService, "updateStarStatus").resolves(updatedNote);

      await notesController.updateStarStatus(req, res, next);

      sinon.assert.calledOnceWithExactly(
        notesService.updateStarStatus,
        "note-1",
        userId,
        true
      );
      sinon.assert.calledOnceWithMatch(res.json, {
        success: true,
        message: "Note starred successfully",
        data: updatedNote,
      });
    });

    it('should respond with "unstarred" message when isStarred is false', async () => {
      req.params.id = "note-1";
      req.body = { isStarred: false };
      const updatedNote = { id: "note-1", isStarred: false };
      sinon.stub(notesService, "updateStarStatus").resolves(updatedNote);

      await notesController.updateStarStatus(req, res, next);

      sinon.assert.calledOnceWithMatch(res.json, {
        success: true,
        message: "Note unstarred successfully",
        data: updatedNote,
      });
    });

    it("should call next(error) when isStarred is not a boolean", async () => {
      req.params.id = "note-1";
      req.body = { isStarred: "true" };
      const error = new Error("isStarred must be a boolean value");
      error.statusCode = 400;
      sinon.stub(notesService, "updateStarStatus").rejects(error);

      await notesController.updateStarStatus(req, res, next);

      sinon.assert.calledOnceWithExactly(next, error);
    });

    it("should call next(error) with 404 when the note is not found", async () => {
      req.params.id = "bad-id";
      req.body = { isStarred: true };
      const error = new Error("Note not found");
      error.statusCode = 404;
      sinon.stub(notesService, "updateStarStatus").rejects(error);

      await notesController.updateStarStatus(req, res, next);

      sinon.assert.calledOnceWithExactly(next, error);
    });
  });
//get starred notes
  describe("getStarredNotes()", () => {
    it("should respond 200 with only starred notes", async () => {
      const starred = [{ id: "note-1", isStarred: true }];
      sinon.stub(notesService, "getStarredNotes").resolves(starred);

      await notesController.getStarredNotes(req, res, next);

      sinon.assert.calledOnceWithExactly(notesService.getStarredNotes, userId);
      sinon.assert.calledOnceWithMatch(res.json, {
        success: true,
        message: "Starred notes fetched successfully",
        data: starred,
      });
    });

    it("should call next(error) when getStarredNotes throws", async () => {
      const error = new Error("Query failed");
      sinon.stub(notesService, "getStarredNotes").rejects(error);

      await notesController.getStarredNotes(req, res, next);

      sinon.assert.calledOnceWithExactly(next, error);
    });
  });
  //search notes
  describe("searchNotes()", () => {
    it("should respond 200 with search results using the query param", async () => {
      req.query.q = "grocery";
      const results = [{ id: "note-1", title: "Grocery list" }];
      sinon.stub(notesService, "searchNotes").resolves(results);

      await notesController.searchNotes(req, res, next);

      sinon.assert.calledOnceWithExactly(notesService.searchNotes, userId, "grocery");
      sinon.assert.calledOnceWithMatch(res.json, {
        success: true,
        message: "Search completed successfully",
        data: results,
      });
    });

    it("should call next(error) with 400 when the query is missing", async () => {
      req.query.q = undefined;
      const error = new Error("Search query is required");
      error.statusCode = 400;
      sinon.stub(notesService, "searchNotes").rejects(error);

      await notesController.searchNotes(req, res, next);

      sinon.assert.calledOnceWithExactly(next, error);
    });

    it("should call next(error) when searchNotes throws a database error", async () => {
      req.query.q = "grocery";
      const error = new Error("Search index down");
      sinon.stub(notesService, "searchNotes").rejects(error);

      await notesController.searchNotes(req, res, next);

      sinon.assert.calledOnceWithExactly(next, error);
    });
  });
});