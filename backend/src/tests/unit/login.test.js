// require("dotenv").config();

// const { expect } = require("chai");
// const sinon = require("sinon");
// const bcrypt = require("bcrypt");

// const prismaPath = require.resolve("../../config/prisma");
// const jwtPath = require.resolve("../../utils/jwt");
// const authServicePath = require.resolve("../../services/auth.service");

// describe("loginUser()", () => {
//   let prismaStub, jwtStub, authService;

//   beforeEach(() => {
//     prismaStub = {
//       user: {
//         findUnique: sinon.stub(),
//       },
//     };

//     jwtStub = {
//       generateToken: sinon.stub(),
//       verifyToken: sinon.stub(),
//     };

//     require.cache[prismaPath] = {
//       id: prismaPath,
//       filename: prismaPath,
//       loaded: true,
//       exports: prismaStub,
//     };

//     require.cache[jwtPath] = {
//       id: jwtPath,
//       filename: jwtPath,
//       loaded: true,
//       exports: jwtStub,
//     };

//     delete require.cache[authServicePath];
//     authService = require("../../services/auth.service");
//   });

//   afterEach(() => {
//     sinon.restore();
//     delete require.cache[prismaPath];
//     delete require.cache[jwtPath];
//     delete require.cache[authServicePath];
//   });

//   it("should login successfully", async () => {
//     prismaStub.user.findUnique.resolves({
//       id: "123",
//       firstName: "Ali",
//       lastName: "Khan",
//       email: "ali@gmail.com",
//       password: "hashedPassword",
//     });

//     sinon.stub(bcrypt, "compare").resolves(true);

//     jwtStub.generateToken.returns("fake-token");
//     try{
//     const result = await authService.loginUser({
//       email: "ali@gmail.com",
//       password: "password123!",
//     });

//     expect(result.user.email).to.equal("ali@gmail.com");
//     expect(result.token).to.equal("fake-token");

//     sinon.assert.calledOnce(prismaStub.user.findUnique);
//     sinon.assert.calledOnce(bcrypt.compare);
//     sinon.assert.calledOnce(jwtStub.generateToken);
//   }catch(err){
//       throw err;
//   }
//   });

//   it("should reject invalid password", async () => {
//     prismaStub.user.findUnique.resolves({
//       id: "123",
//       email: "ali@gmail.com",
//       password: "hashedPassword",
//     });

//     sinon.stub(bcrypt, "compare").resolves(false);

//     try {
//       await authService.loginUser({
//         email: "ali@gmail.com",
//         password: "wrongpassword",
//       });
//       expect.fail("Expected loginUser to throw");
//     } catch (err) {
//       expect(err.message).to.equal(" Invalid password, try again");
//       expect(err.statusCode).to.equal(401);
//     }

//     sinon.assert.notCalled(jwtStub.generateToken);
//   });

//   it("should reject unknown email", async () => {
//     prismaStub.user.findUnique.resolves(null);

//     try {
//       await authService.loginUser({
//         email: "nouser@gmail.com",
//         password: "password123!",
//       });
//       expect.fail("Expected loginUser to throw");
//     } catch (err) {
//       expect(err.message).to.equal("Invalid email or password");
//       expect(err.statusCode).to.equal(401);
//     }
//   });
// });

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
        findUnique: sinon.stub(),
        update: sinon.stub(),
        updateMany: sinon.stub(),
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
    try {
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
    } catch (err) {
      expect.fail(err.message);
    }
  });

  //getallnotes for a person
  describe("getAllNotes()", () => {
    try {
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
    }
    catch (err) {
      expect.fail(err.message);
    }
  });

  //get one note by specific id
  describe("getNoteById()", () => {
    try {
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
    }
    catch (err) {
      expect.fail(err.message);
    }
  });

  //updating the note
  describe("updateNote()", () => {
    try {
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
    } catch (err) {
      expect.fail(err.message);
    }
  });

  //deleting note
  describe("deleteNote()", () => {
    try {
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
    } catch (err) {
      expect.fail(err.message);
    }
  });

  // changing star

  it("should star a note successfully", async () => {
    try {
      prismaStub.note.updateMany.resolves({
        count: 1,
      });

      prismaStub.note.findUnique.resolves({
        id: "note-1",
        title: "Test",
        content: "Body",
        isStarred: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      const result = await notesService.updateStarStatus(
        "note-1",
        userId,
        true
      );

      expect(result.isStarred).to.equal(true);
      sinon.assert.calledOnce(prismaStub.note.updateMany);

    } catch (err) {
      expect.fail(err.message);
    }
  });

  it("should unstar a note successfully", async () => {
    try {
      prismaStub.note.updateMany.resolves({
        count: 1,
      });

      prismaStub.note.findUnique.resolves({
        id: "note-1",
        title: "Test",
        content: "Body",
        isStarred: false,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      const result = await notesService.updateStarStatus(
        "note-1",
        userId,
        false
      );

      expect(result.isStarred).to.equal(false);
      sinon.assert.calledOnce(prismaStub.note.updateMany);

    } catch (err) {
      expect.fail(err.message);
    }
  });
});