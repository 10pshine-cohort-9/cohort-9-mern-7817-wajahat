require("dotenv").config();

const { expect } = require("chai");
const sinon = require("sinon");

const prismaPath = require.resolve("../../config/prisma");
const notesServicePath = require.resolve("../../services/notes.service");

describe("notes api checking", () => {
  let prismaStub, notesService;
  const userId = "user-1";

  beforeEach(() => {
    prismaStub = {
      note: {
        create: sinon.stub(),
        findMany: sinon.stub(),
        findFirst: sinon.stub(),
        update: sinon.stub(),
        delete: sinon.stub(),
      },
    };

    require.cache[prismaPath] = {
      id: prismaPath,
      filename: prismaPath,
      loaded: true,
      exports: prismaStub,
    };

    delete require.cache[notesServicePath];
    notesService = require("../../services/notes.service");
  });

  afterEach(() => {
    sinon.restore();
    delete require.cache[prismaPath];
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

      const result = await notesService.createNote({
        title: "Test",
        content: "Body",
        userId,
      });

      expect(result.id).to.equal("note-1");
      expect(result.title).to.equal("Test");
      sinon.assert.calledOnce(prismaStub.note.create);
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
  });

  //getallnotes for a person
  describe("getAllNotes()", () => {
    it("should return all notes for a user", async () => {
      prismaStub.note.findMany.resolves([
        { id: "note-1", title: "note 1 by user note 1", content: "<bold>this is bold note</bold>", isStarred: false },
        { id: "note-2", title: "note 2", content: "<p>this is a big para in note</p>", isStarred: true },
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
  });

  //get one note by specific id
  describe("getNoteById()", () => {
    it("should return the note if found", async () => {
      prismaStub.note.findFirst.resolves({ id: "note-1", title: "Test", content: "Body" });

      const result = await notesService.getNoteById("note-1", userId);

      expect(result.id).to.equal("note-1");
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
  });

  //updating the note
  describe("updateNote()", () => {
    it("should update the note if it exists", async () => {
      prismaStub.note.findFirst.resolves({ id: "note-1", userId });
      prismaStub.note.update.resolves({
        id: "note-1",
        title: "Updated",
        content: "New body",
      });

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
      }
      sinon.assert.notCalled(prismaStub.note.update);
    });
  });

  //deleting note
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
      }
      sinon.assert.notCalled(prismaStub.note.delete);
    });
  });

  // changing star
  describe("toggleStar()", () => {
    it("should flip isStarred from false to true", async () => {
      prismaStub.note.findFirst.resolves({ id: "note-1", userId, isStarred: false });
      prismaStub.note.update.resolves({ id: "note-1", isStarred: true });

      const result = await notesService.toggleStar("note-1", userId);

      expect(result.isStarred).to.equal(true);
    });

    it("should throw 404 if note not found", async () => {
      prismaStub.note.findFirst.resolves(null);

      try {
        await notesService.toggleStar("bad-id", userId);
        expect.fail("Expected toggleStar to throw");
      } catch (err) {
        expect(err.statusCode).to.equal(404);
      }
    });
  });
});