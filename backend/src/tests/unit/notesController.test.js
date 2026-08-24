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

      expect(notesService.createNote.calledOnce).to.be.true;
      expect(
        notesService.createNote.calledWithMatch({
          title: "Test",
          content: "Body",
          userId,
        })
      ).to.be.true;

      expect(res.status.calledOnce).to.be.true;
      expect(res.status.calledWithExactly(201)).to.be.true;

      expect(res.json.calledOnce).to.be.true;
      expect(
        res.json.calledWithMatch({
          success: true,
          message: "note created successfully",
          data: serviceResult,
        })
      ).to.be.true;

      expect(next.called).to.be.false;
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

      expect(next.calledOnce).to.be.true;
      expect(next.calledWithExactly(error)).to.be.true;
      expect(res.status.called).to.be.false;
    });
  });

  //get all notes
  describe("getAllNotes()", () => {
    it("should respond 200 with the user's notes on success", async () => {
      const notes = [{ id: "note-1" }, { id: "note-2" }];
      sinon.stub(notesService, "getAllNotes").resolves(notes);

      await notesController.getAllNotes(req, res, next);

      expect(notesService.getAllNotes.calledOnce).to.be.true;
      expect(notesService.getAllNotes.calledWithExactly(userId)).to.be.true;

      expect(res.status.calledOnce).to.be.true;
      expect(res.status.calledWithExactly(200)).to.be.true;

      expect(res.json.calledOnce).to.be.true;
      expect(
        res.json.calledWithMatch({
          success: true,
          message: "notes fetched successfully",
          data: notes,
        })
      ).to.be.true;
    });

    it("should call next(error) when getAllNotes throws", async () => {
      const error = new Error("Connection lost");
      sinon.stub(notesService, "getAllNotes").rejects(error);

      await notesController.getAllNotes(req, res, next);

      expect(next.calledOnce).to.be.true;
      expect(next.calledWithExactly(error)).to.be.true;
    });
  });

  //get one note by id
  describe("getNoteById()", () => {
    it("should respond 200 with the note on success", async () => {
      req.params.id = "note-1";
      const note = { id: "note-1", title: "Test" };
      sinon.stub(notesService, "getNoteById").resolves(note);

      await notesController.getNoteById(req, res, next);

      expect(notesService.getNoteById.calledOnce).to.be.true;
      expect(notesService.getNoteById.calledWithExactly("note-1", userId)).to.be.true;

      expect(res.status.calledOnce).to.be.true;
      expect(res.status.calledWithExactly(200)).to.be.true;

      expect(res.json.calledOnce).to.be.true;
      expect(
        res.json.calledWithMatch({
          success: true,
          message: "Note fetched successfully",
          data: note,
        })
      ).to.be.true;
    });

    it("should call next(error) with 404 when the note is not found", async () => {
      req.params.id = "bad-id";
      const error = new Error("Note not found");
      error.statusCode = 404;
      sinon.stub(notesService, "getNoteById").rejects(error);

      await notesController.getNoteById(req, res, next);

      expect(next.calledOnce).to.be.true;
      expect(next.calledWithExactly(error)).to.be.true;
      expect(res.status.called).to.be.false;
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

      expect(notesService.updateNote.calledOnce).to.be.true;
      expect(
        notesService.updateNote.calledWithExactly("note-1", userId, req.body)
      ).to.be.true;

      expect(res.status.calledOnce).to.be.true;
      expect(res.status.calledWithExactly(200)).to.be.true;

      expect(res.json.calledOnce).to.be.true;
      expect(
        res.json.calledWithMatch({
          success: true,
          message: "Note updated successfully",
          data: updatedNote,
        })
      ).to.be.true;
    });

    it("should call next(error) with 404 when the note is not found", async () => {
      req.params.id = "bad-id";
      const error = new Error("Note not found");
      error.statusCode = 404;
      sinon.stub(notesService, "updateNote").rejects(error);

      await notesController.updateNote(req, res, next);

      expect(next.calledOnce).to.be.true;
      expect(next.calledWithExactly(error)).to.be.true;
    });
  });

  //delete note
  describe("deleteNote()", () => {
    it("should respond 200 with the service message on success", async () => {
      req.params.id = "note-1";
      sinon.stub(notesService, "deleteNote").resolves({ message: "Note deleted successfully" });

      await notesController.deleteNote(req, res, next);

      expect(notesService.deleteNote.calledOnce).to.be.true;
      expect(notesService.deleteNote.calledWithExactly("note-1", userId)).to.be.true;

      expect(res.status.calledOnce).to.be.true;
      expect(res.status.calledWithExactly(200)).to.be.true;

      expect(res.json.calledOnce).to.be.true;
      expect(
        res.json.calledWithMatch({
          success: true,
          message: "Note deleted successfully",
        })
      ).to.be.true;
    });

    it("should call next(error) with 404 when the note is not found", async () => {
      req.params.id = "bad-id";
      const error = new Error("Note not found");
      error.statusCode = 404;
      sinon.stub(notesService, "deleteNote").rejects(error);

      await notesController.deleteNote(req, res, next);

      expect(next.calledOnce).to.be.true;
      expect(next.calledWithExactly(error)).to.be.true;
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

      expect(notesService.updateStarStatus.calledOnce).to.be.true;
      expect(
        notesService.updateStarStatus.calledWithExactly("note-1", userId, true)
      ).to.be.true;

      expect(
        res.json.calledWithMatch({
          success: true,
          message: "Note starred successfully",
          data: updatedNote,
        })
      ).to.be.true;
    });

    it('should respond with "unstarred" message when isStarred is false', async () => {
      req.params.id = "note-1";
      req.body = { isStarred: false };
      const updatedNote = { id: "note-1", isStarred: false };
      sinon.stub(notesService, "updateStarStatus").resolves(updatedNote);

      await notesController.updateStarStatus(req, res, next);

      expect(
        res.json.calledWithMatch({
          success: true,
          message: "Note unstarred successfully",
          data: updatedNote,
        })
      ).to.be.true;
    });

    it("should call next(error) when isStarred is not a boolean", async () => {
      req.params.id = "note-1";
      req.body = { isStarred: "true" };
      const error = new Error("isStarred must be a boolean value");
      error.statusCode = 400;
      sinon.stub(notesService, "updateStarStatus").rejects(error);

      await notesController.updateStarStatus(req, res, next);

      expect(next.calledOnce).to.be.true;
      expect(next.calledWithExactly(error)).to.be.true;
    });

    it("should call next(error) with 404 when the note is not found", async () => {
      req.params.id = "bad-id";
      req.body = { isStarred: true };
      const error = new Error("Note not found");
      error.statusCode = 404;
      sinon.stub(notesService, "updateStarStatus").rejects(error);

      await notesController.updateStarStatus(req, res, next);

      expect(next.calledOnce).to.be.true;
      expect(next.calledWithExactly(error)).to.be.true;
    });
  });

  //get starred notes
  describe("getStarredNotes()", () => {
    it("should respond 200 with only starred notes", async () => {
      const starred = [{ id: "note-1", isStarred: true }];
      sinon.stub(notesService, "getStarredNotes").resolves(starred);

      await notesController.getStarredNotes(req, res, next);

      expect(notesService.getStarredNotes.calledOnce).to.be.true;
      expect(notesService.getStarredNotes.calledWithExactly(userId)).to.be.true;

      expect(
        res.json.calledWithMatch({
          success: true,
          message: "Starred notes fetched successfully",
          data: starred,
        })
      ).to.be.true;
    });

    it("should call next(error) when getStarredNotes throws", async () => {
      const error = new Error("Query failed");
      sinon.stub(notesService, "getStarredNotes").rejects(error);

      await notesController.getStarredNotes(req, res, next);

      expect(next.calledOnce).to.be.true;
      expect(next.calledWithExactly(error)).to.be.true;
    });
  });

  //search notes
  describe("searchNotes()", () => {
    it("should respond 200 with search results using the query param", async () => {
      req.query.q = "grocery";
      const results = [{ id: "note-1", title: "Grocery list" }];
      sinon.stub(notesService, "searchNotes").resolves(results);

      await notesController.searchNotes(req, res, next);

      expect(notesService.searchNotes.calledOnce).to.be.true;
      expect(notesService.searchNotes.calledWithExactly(userId, "grocery")).to.be.true;

      expect(
        res.json.calledWithMatch({
          success: true,
          message: "Search completed successfully",
          data: results,
        })
      ).to.be.true;
    });

    it("should call next(error) with 400 when the query is missing", async () => {
      req.query.q = undefined;
      const error = new Error("Search query is required");
      error.statusCode = 400;
      sinon.stub(notesService, "searchNotes").rejects(error);

      await notesController.searchNotes(req, res, next);

      expect(next.calledOnce).to.be.true;
      expect(next.calledWithExactly(error)).to.be.true;
    });

    it("should call next(error) when searchNotes throws a database error", async () => {
      req.query.q = "grocery";
      const error = new Error("Search index down");
      sinon.stub(notesService, "searchNotes").rejects(error);

      await notesController.searchNotes(req, res, next);

      expect(next.calledOnce).to.be.true;
      expect(next.calledWithExactly(error)).to.be.true;
    });
  });
});