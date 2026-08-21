require("dotenv").config();

const { expect } = require("chai");
const sinon = require("sinon");

const prismaPath = require.resolve("../../config/prisma");
const loggerPath = require.resolve("../../config/logger");
const notesServicePath = require.resolve("../../services/notes.service");

describe("notes.service", () => {
  let prismaStub, loggerStub, notesService;
  const userId = "user-1";

  beforeEach(() => {
    prismaStub = {
      note: {
        create: sinon.stub(),
        findMany: sinon.stub(),
        findFirst: sinon.stub(),
        findUnique: sinon.stub(),
        update: sinon.stub(),
        updateMany: sinon.stub(),
        delete: sinon.stub(),
      },
    };

    loggerStub = {
      info: sinon.stub(),
      warn: sinon.stub(),
      error: sinon.stub(),
    };

    require.cache[prismaPath] = {
      id: prismaPath,
      filename: prismaPath,
      loaded: true,
      exports: prismaStub,
    };

    require.cache[loggerPath] = {
      id: loggerPath,
      filename: loggerPath,
      loaded: true,
      exports: loggerStub,
    };

    delete require.cache[notesServicePath];
    notesService = require("../../services/notes.service");
  });

  afterEach(() => {
    sinon.restore();
    delete require.cache[prismaPath];
    delete require.cache[loggerPath];
    delete require.cache[notesServicePath];
  });
//create note
  describe("createNote()", () => {
    it("should create a note successfully", async () => {
      prismaStub.note.create.resolves({
        id: "note-1",
        title: "Test",
        content: "Body",
        isStarred: false,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      const result = await notesService.createNote({ title: "Test", content: "Body", userId });

      expect(result.id).to.equal("note-1");
      expect(result.title).to.equal("Test");
      sinon.assert.calledOnce(prismaStub.note.create);
      sinon.assert.calledOnce(loggerStub.info);
    });

    it("should throw 400 if title is missing", async () => {
      try {
        await notesService.createNote({ content: "Body", userId });
        expect.fail("Expected createNote to throw");
      } catch (err) {
        expect(err.statusCode).to.equal(400);
        expect(err.message).to.equal("Title and content are required");
      }
      sinon.assert.notCalled(prismaStub.note.create);
    });

    it("should throw 400 if content is missing", async () => {
      try {
        await notesService.createNote({ title: "Test", userId });
        expect.fail("Expected createNote to throw");
      } catch (err) {
        expect(err.statusCode).to.equal(400);
        expect(err.message).to.equal("Title and content are required");
      }
      sinon.assert.notCalled(prismaStub.note.create);
    });

    it("should throw 400 if both title and content are missing", async () => {
      try {
        await notesService.createNote({ userId });
        expect.fail("Expected createNote to throw");
      } catch (err) {
        expect(err.statusCode).to.equal(400);
      }
    });

    it("should throw 400 if title is an empty string", async () => {
      try {
        await notesService.createNote({ title: "", content: "Body", userId });
        expect.fail("Expected createNote to throw");
      } catch (err) {
        expect(err.statusCode).to.equal(400);
      }
    });

    it("should propagate 500 on database error", async () => {
      prismaStub.note.create.rejects(new Error("Insert failed"));

      try {
        await notesService.createNote({ title: "Test", content: "Body", userId });
        expect.fail("Expected createNote to throw");
      } catch (err) {
        expect(err.statusCode).to.equal(500);
        expect(err.message).to.equal("Insert failed");
      }
    });

    it("should not overwrite an existing statusCode from a downstream error", async () => {
      const dbError = new Error("Foreign key violation");
      dbError.statusCode = 422;
      prismaStub.note.create.rejects(dbError);

      try {
        await notesService.createNote({ title: "Test", content: "Body", userId });
        expect.fail("Expected createNote to throw");
      } catch (err) {
        expect(err.statusCode).to.equal(422);
      }
    });
  });

  //all notes
  describe("getAllNotes()", () => {
    it("should return all notes for a user", async () => {
      prismaStub.note.findMany.resolves([
        { id: "note-1", title: "note 1", content: "body 1", isStarred: false },
        { id: "note-2", title: "note 2", content: "body 2", isStarred: true },
      ]);

      const result = await notesService.getAllNotes(userId);

      expect(result).to.have.lengthOf(2);
      sinon.assert.calledOnce(prismaStub.note.findMany);
    });

    it("should return an empty array if user has no notes", async () => {
      prismaStub.note.findMany.resolves([]);

      const result = await notesService.getAllNotes(userId);

      expect(result).to.deep.equal([]);
    });

    it("should log the note count on success", async () => {
      prismaStub.note.findMany.resolves([{ id: "note-1" }]);

      await notesService.getAllNotes(userId);

      sinon.assert.calledOnce(loggerStub.info);
      const logPayload = loggerStub.info.firstCall.args[0];
      expect(logPayload.count).to.equal(1);
      expect(logPayload.userId).to.equal(userId);
    });

    it("should propagate 500 on database error", async () => {
      prismaStub.note.findMany.rejects(new Error("Connection lost"));

      try {
        await notesService.getAllNotes(userId);
        expect.fail("Expected getAllNotes to throw");
      } catch (err) {
        expect(err.statusCode).to.equal(500);
        expect(err.message).to.equal("Connection lost");
      }
    });
  });
//get note by id
  describe("getNoteById()", () => {
    it("should return the note if found", async () => {
      prismaStub.note.findFirst.resolves({
        id: "note-1",
        title: "Test",
        content: "Body",
        isStarred: false,
      });

      const result = await notesService.getNoteById("note-1", userId);

      expect(result.id).to.equal("note-1");
      sinon.assert.calledOnce(loggerStub.info);
    });

    it("should scope the lookup to both noteId and userId", async () => {
      prismaStub.note.findFirst.resolves({ id: "note-1" });

      await notesService.getNoteById("note-1", userId);

      sinon.assert.calledWithMatch(prismaStub.note.findFirst, {
        where: { id: "note-1", userId },
      });
    });

    it("should throw 404 if note not found", async () => {
      prismaStub.note.findFirst.resolves(null);

      try {
        await notesService.getNoteById("bad-id", userId);
        expect.fail("Expected getNoteById to throw");
      } catch (err) {
        expect(err.statusCode).to.equal(404);
        expect(err.message).to.equal("Note not found");
      }
    });

    it("should throw 404 if note belongs to a different user", async () => {
      // findFirst is scoped by userId in the where clause, so a note owned by
      // someone else resolves to null from Prisma's perspective
      prismaStub.note.findFirst.resolves(null);

      try {
        await notesService.getNoteById("note-owned-by-another-user", userId);
        expect.fail("Expected getNoteById to throw");
      } catch (err) {
        expect(err.statusCode).to.equal(404);
      }
    });

    it("should propagate 500 on database error", async () => {
      prismaStub.note.findFirst.rejects(new Error("Query timeout"));

      try {
        await notesService.getNoteById("note-1", userId);
        expect.fail("Expected getNoteById to throw");
      } catch (err) {
        expect(err.statusCode).to.equal(500);
        expect(err.message).to.equal("Query timeout");
      }
    });

    it("should not overwrite an existing statusCode from a downstream error", async () => {
      const dbError = new Error("Access denied");
      dbError.statusCode = 403;
      prismaStub.note.findFirst.rejects(dbError);

      try {
        await notesService.getNoteById("note-1", userId);
        expect.fail("Expected getNoteById to throw");
      } catch (err) {
        expect(err.statusCode).to.equal(403);
      }
    });
  });
//update ntoe
  describe("updateNote()", () => {
    it("should update the note if it exists", async () => {
      prismaStub.note.findFirst.resolves({ id: "note-1", userId });
      prismaStub.note.update.resolves({ id: "note-1", title: "Updated", content: "New body" });

      const result = await notesService.updateNote("note-1", userId, {
        title: "Updated",
        content: "New body",
      });

      expect(result.title).to.equal("Updated");
      sinon.assert.calledOnce(prismaStub.note.update);
    });

    it("should throw 404 if note not found", async () => {
      prismaStub.note.findFirst.resolves(null);

      try {
        await notesService.updateNote("bad-id", userId, { title: "x", content: "y" });
        expect.fail("Expected updateNote to throw");
      } catch (err) {
        expect(err.statusCode).to.equal(404);
        expect(err.message).to.equal("Note not found");
      }
      sinon.assert.notCalled(prismaStub.note.update);
    });

    it("should verify ownership before checking update (find is scoped to userId)", async () => {
      prismaStub.note.findFirst.resolves({ id: "note-1", userId });
      prismaStub.note.update.resolves({ id: "note-1", title: "Updated" });

      await notesService.updateNote("note-1", userId, { title: "Updated", content: "New" });

      sinon.assert.calledWithMatch(prismaStub.note.findFirst, {
        where: { id: "note-1", userId },
      });
    });

    it("should propagate 500 if findFirst throws", async () => {
      prismaStub.note.findFirst.rejects(new Error("Lookup failed"));

      try {
        await notesService.updateNote("note-1", userId, { title: "x", content: "y" });
        expect.fail("Expected updateNote to throw");
      } catch (err) {
        expect(err.statusCode).to.equal(500);
      }
    });

    it("should propagate 500 if update throws", async () => {
      prismaStub.note.findFirst.resolves({ id: "note-1", userId });
      prismaStub.note.update.rejects(new Error("Update failed"));

      try {
        await notesService.updateNote("note-1", userId, { title: "x", content: "y" });
        expect.fail("Expected updateNote to throw");
      } catch (err) {
        expect(err.statusCode).to.equal(500);
        expect(err.message).to.equal("Update failed");
      }
    });

    it("should not overwrite an existing statusCode from a downstream error", async () => {
      const dbError = new Error("Conflict");
      dbError.statusCode = 409;
      prismaStub.note.findFirst.resolves({ id: "note-1", userId });
      prismaStub.note.update.rejects(dbError);

      try {
        await notesService.updateNote("note-1", userId, { title: "x", content: "y" });
        expect.fail("Expected updateNote to throw");
      } catch (err) {
        expect(err.statusCode).to.equal(409);
      }
    });
  });
//hard delete note
  describe("deleteNote()", () => {
    it("should delete the note if it exists", async () => {
      prismaStub.note.findFirst.resolves({ id: "note-1", userId });
      prismaStub.note.delete.resolves({});

      const result = await notesService.deleteNote("note-1", userId);

      expect(result.message).to.equal("Note deleted successfully");
      sinon.assert.calledOnce(prismaStub.note.delete);
    });

    it("should throw 404 if note not found", async () => {
      prismaStub.note.findFirst.resolves(null);

      try {
        await notesService.deleteNote("bad-id", userId);
        expect.fail("Expected deleteNote to throw");
      } catch (err) {
        expect(err.statusCode).to.equal(404);
        expect(err.message).to.equal("Note not found");
      }
      sinon.assert.notCalled(prismaStub.note.delete);
    });

    it("should delete using only the noteId in the where clause", async () => {
      prismaStub.note.findFirst.resolves({ id: "note-1", userId });
      prismaStub.note.delete.resolves({});

      await notesService.deleteNote("note-1", userId);

      sinon.assert.calledWithMatch(prismaStub.note.delete, { where: { id: "note-1" } });
    });

    it("should propagate 500 if findFirst throws", async () => {
      prismaStub.note.findFirst.rejects(new Error("Lookup crashed"));

      try {
        await notesService.deleteNote("note-1", userId);
        expect.fail("Expected deleteNote to throw");
      } catch (err) {
        expect(err.statusCode).to.equal(500);
      }
    });

    it("should propagate 500 if delete throws", async () => {
      prismaStub.note.findFirst.resolves({ id: "note-1", userId });
      prismaStub.note.delete.rejects(new Error("Delete failed"));

      try {
        await notesService.deleteNote("note-1", userId);
        expect.fail("Expected deleteNote to throw");
      } catch (err) {
        expect(err.statusCode).to.equal(500);
        expect(err.message).to.equal("Delete failed");
      }
    });
  });
  //changing star notes star status 
  describe("updateStarStatus()", () => {
    it("should star a note successfully", async () => {
      prismaStub.note.updateMany.resolves({ count: 1 });
      prismaStub.note.findUnique.resolves({
        id: "note-1",
        title: "Test",
        content: "Body",
        isStarred: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      const result = await notesService.updateStarStatus("note-1", userId, true);

      expect(result.isStarred).to.equal(true);
      sinon.assert.calledOnce(prismaStub.note.updateMany);
    });

    it("should unstar a note successfully", async () => {
      prismaStub.note.updateMany.resolves({ count: 1 });
      prismaStub.note.findUnique.resolves({
        id: "note-1",
        isStarred: false,
      });

      const result = await notesService.updateStarStatus("note-1", userId, false);

      expect(result.isStarred).to.equal(false);
    });

    it("should throw 400 if isStarred is not a boolean (string)", async () => {
      try {
        await notesService.updateStarStatus("note-1", userId, "true");
        expect.fail("Expected updateStarStatus to throw");
      } catch (err) {
        expect(err.statusCode).to.equal(400);
        expect(err.message).to.equal("isStarred must be a boolean value");
      }
      sinon.assert.notCalled(prismaStub.note.updateMany);
    });

    it("should throw 400 if isStarred is undefined", async () => {
      try {
        await notesService.updateStarStatus("note-1", userId, undefined);
        expect.fail("Expected updateStarStatus to throw");
      } catch (err) {
        expect(err.statusCode).to.equal(400);
      }
    });

    it("should throw 400 if isStarred is a number", async () => {
      try {
        await notesService.updateStarStatus("note-1", userId, 1);
        expect.fail("Expected updateStarStatus to throw");
      } catch (err) {
        expect(err.statusCode).to.equal(400);
      }
    });

    it("should throw 400 if isStarred is null", async () => {
      try {
        await notesService.updateStarStatus("note-1", userId, null);
        expect.fail("Expected updateStarStatus to throw");
      } catch (err) {
        expect(err.statusCode).to.equal(400);
      }
    });

    it("should throw 404 if no matching note was updated (count 0)", async () => {
      prismaStub.note.updateMany.resolves({ count: 0 });

      try {
        await notesService.updateStarStatus("bad-id", userId, true);
        expect.fail("Expected updateStarStatus to throw");
      } catch (err) {
        expect(err.statusCode).to.equal(404);
        expect(err.message).to.equal("Note not found");
      }
      sinon.assert.notCalled(prismaStub.note.findUnique);
    });

    it("should scope updateMany to both noteId and userId", async () => {
      prismaStub.note.updateMany.resolves({ count: 1 });
      prismaStub.note.findUnique.resolves({ id: "note-1", isStarred: true });

      await notesService.updateStarStatus("note-1", userId, true);

      sinon.assert.calledWithMatch(prismaStub.note.updateMany, {
        where: { id: "note-1", userId },
        data: { isStarred: true },
      });
    });

    it("should propagate 500 if updateMany throws", async () => {
      prismaStub.note.updateMany.rejects(new Error("Update crashed"));

      try {
        await notesService.updateStarStatus("note-1", userId, true);
        expect.fail("Expected updateStarStatus to throw");
      } catch (err) {
        expect(err.statusCode).to.equal(500);
      }
    });

    it("should propagate 500 if the follow-up findUnique throws", async () => {
      prismaStub.note.updateMany.resolves({ count: 1 });
      prismaStub.note.findUnique.rejects(new Error("Read failed after write"));

      try {
        await notesService.updateStarStatus("note-1", userId, true);
        expect.fail("Expected updateStarStatus to throw");
      } catch (err) {
        expect(err.statusCode).to.equal(500);
        expect(err.message).to.equal("Read failed after write");
      }
    });
  });
//getting starred notes
  describe("getStarredNotes()", () => {
    it("should return only starred notes for the user", async () => {
      prismaStub.note.findMany.resolves([
        { id: "note-1", title: "Starred 1", isStarred: true },
        { id: "note-2", title: "Starred 2", isStarred: true },
      ]);

      const result = await notesService.getStarredNotes(userId);

      expect(result).to.have.lengthOf(2);
      sinon.assert.calledWithMatch(prismaStub.note.findMany, {
        where: { userId, isStarred: true },
        orderBy: { updatedAt: "desc" },
      });
    });

    it("should return an empty array if user has no starred notes", async () => {
      prismaStub.note.findMany.resolves([]);

      const result = await notesService.getStarredNotes(userId);

      expect(result).to.deep.equal([]);
    });

    it("should log the starred note count", async () => {
      prismaStub.note.findMany.resolves([{ id: "note-1" }, { id: "note-2" }]);

      await notesService.getStarredNotes(userId);

      const logPayload = loggerStub.info.firstCall.args[0];
      expect(logPayload.count).to.equal(2);
    });

    it("should propagate 500 on database error", async () => {
      prismaStub.note.findMany.rejects(new Error("Query failed"));

      try {
        await notesService.getStarredNotes(userId);
        expect.fail("Expected getStarredNotes to throw");
      } catch (err) {
        expect(err.statusCode).to.equal(500);
        expect(err.message).to.equal("Query failed");
      }
    });
  });
//searching notes
  describe("searchNotes()", () => {
    it("should return matching notes for a valid query", async () => {
      prismaStub.note.findMany.resolves([
        { id: "note-1", title: "Grocery list", content: "milk, eggs" },
      ]);

      const result = await notesService.searchNotes(userId, "grocery");

      expect(result).to.have.lengthOf(1);
      sinon.assert.calledOnce(prismaStub.note.findMany);
    });

    it("should search both title and content fields (case-insensitive)", async () => {
      prismaStub.note.findMany.resolves([]);

      await notesService.searchNotes(userId, "todo");

      const callArgs = prismaStub.note.findMany.firstCall.args[0];
      expect(callArgs.where.userId).to.equal(userId);
      expect(callArgs.where.OR).to.have.lengthOf(2);
      expect(callArgs.where.OR[0].title).to.deep.equal({ contains: "todo", mode: "insensitive" });
      expect(callArgs.where.OR[1].content).to.deep.equal({ contains: "todo", mode: "insensitive" });
    });

    it("should throw 400 if query is missing", async () => {
      try {
        await notesService.searchNotes(userId, undefined);
        expect.fail("Expected searchNotes to throw");
      } catch (err) {
        expect(err.statusCode).to.equal(400);
        expect(err.message).to.equal("Search query is required");
      }
      sinon.assert.notCalled(prismaStub.note.findMany);
    });

    it("should throw 400 if query is an empty string", async () => {
      try {
        await notesService.searchNotes(userId, "");
        expect.fail("Expected searchNotes to throw");
      } catch (err) {
        expect(err.statusCode).to.equal(400);
        expect(err.message).to.equal("Search query is required");
      }
    });

    it("should return an empty array if no notes match the query", async () => {
      prismaStub.note.findMany.resolves([]);

      const result = await notesService.searchNotes(userId, "nonexistent-term");

      expect(result).to.deep.equal([]);
    });

    it("should log the query and result count", async () => {
      prismaStub.note.findMany.resolves([{ id: "note-1" }]);

      await notesService.searchNotes(userId, "grocery");

      const logPayload = loggerStub.info.firstCall.args[0];
      expect(logPayload.query).to.equal("grocery");
      expect(logPayload.count).to.equal(1);
    });

    it("should propagate 500 on database error", async () => {
      prismaStub.note.findMany.rejects(new Error("Search index down"));

      try {
        await notesService.searchNotes(userId, "grocery");
        expect.fail("Expected searchNotes to throw");
      } catch (err) {
        expect(err.statusCode).to.equal(500);
        expect(err.message).to.equal("Search index down");
      }
    });
  });
});