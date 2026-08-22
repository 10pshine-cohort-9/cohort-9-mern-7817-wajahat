require("dotenv").config();

const { expect } = require("chai");
const sinon = require("sinon");
const bcrypt = require("bcrypt");

const prisma = require("../../config/prisma");
const jwt = require("../../utils/jwt");
const logger = require("../../config/logger");
const authService = require("../../services/auth.service");

describe("auth.service", () => {
  beforeEach(() => {
    sinon.stub(prisma.user, "findUnique");
    sinon.stub(prisma.user, "create");
    sinon.stub(jwt, "generateToken");
    sinon.stub(jwt, "verifyToken");
    sinon.stub(logger, "info");
    sinon.stub(logger, "warn");
    sinon.stub(logger, "error");
  });

  afterEach(() => {
    sinon.restore();
  });

  describe("registerUser()", () => {
    const validPayload = {
      firstName: "Ali",
      lastName: "Khan",
      email: "ali@gmail.com",
      password: "Password123!",
    };
    // correct signup
    it("should register a new user successfully", async () => {
      prisma.user.findUnique.resolves(null);
      sinon.stub(bcrypt, "hash").resolves("hashed-password");
      prisma.user.create.resolves({
        id: "user-1",
        firstName: "Ali",
        lastName: "Khan",
        email: "ali@gmail.com",
        createdAt: new Date(),
        updatedAt: new Date(),
      });
      jwt.generateToken.returns("fake-token");

      const result = await authService.registerUser(validPayload);

      expect(result.user.id).to.equal("user-1");
      expect(result.user.email).to.equal("ali@gmail.com");
      expect(result.user).to.not.have.property("password");
      expect(result.token).to.equal("fake-token");

      sinon.assert.calledOnce(prisma.user.findUnique);
      sinon.assert.calledOnce(prisma.user.create);
      sinon.assert.calledOnce(jwt.generateToken);
      sinon.assert.calledWithMatch(jwt.generateToken, {
        id: "user-1",
        email: "ali@gmail.com",
      });
    });
    // missing required fields
    describe("missing fields", () => {
      it("should throw 400 if email is missing", async () => {
        try {
          await authService.registerUser({ ...validPayload, email: undefined });
          expect.fail("Expected registerUser to throw");
        } catch (err) {
          expect(err.statusCode).to.equal(400);
          expect(err.message).to.equal("Email and password are required");
        }
        sinon.assert.notCalled(prisma.user.findUnique);
      });

      it("should throw 400 if password is missing", async () => {
        try {
          await authService.registerUser({ ...validPayload, password: undefined });
          expect.fail("Expected registerUser to throw");
        } catch (err) {
          expect(err.statusCode).to.equal(400);
          expect(err.message).to.equal("Email and password are required");
        }
        sinon.assert.notCalled(prisma.user.findUnique);
      });

      it("should throw 400 if both email and password are missing", async () => {
        try {
          await authService.registerUser({ firstName: "Ali", lastName: "Khan" });
          expect.fail("Expected registerUser to throw");
        } catch (err) {
          expect(err.statusCode).to.equal(400);
          expect(err.message).to.equal("Email and password are required");
        }
      });

      it("should throw 400 if email is an empty string", async () => {
        try {
          await authService.registerUser({ ...validPayload, email: "" });
          expect.fail("Expected registerUser to throw");
        } catch (err) {
          expect(err.statusCode).to.equal(400);
          expect(err.message).to.equal("Email and password are required");
        }
      });
    });
    // wrong email
    describe("invalid email", () => {
      const badEmails = [
        "plainstring",
        "missing-at-sign.com",
        "missing-domain@",
        "@missing-local.com",
        "spaces in@email.com",
        "double@@at.com",
      ];

      badEmails.forEach((email) => {
        it(`should throw 400 for malformed email "${email}"`, async () => {
          try {
            await authService.registerUser({ ...validPayload, email });
            expect.fail("Expected registerUser to throw");
          } catch (err) {
            expect(err.statusCode).to.equal(400);
            expect(err.message).to.equal("Invalid email format");
          }
        });
      });

      it("should not query the database when email format is invalid", async () => {
        try {
          await authService.registerUser({ ...validPayload, email: "bad-email" });
        } catch (err) {
          // expected
        }
        sinon.assert.notCalled(prisma.user.findUnique);
      });
    });
    // duplicate emails
    describe("duplicate email", () => {
      it("should throw 409 if email is already registered", async () => {
        prisma.user.findUnique.resolves({
          id: "existing-user",
          email: "ali@gmail.com",
        });

        try {
          await authService.registerUser(validPayload);
          expect.fail("Expected registerUser to throw");
        } catch (err) {
          expect(err.statusCode).to.equal(409);
          expect(err.message).to.equal("Email already registered");
        }

        sinon.assert.calledOnce(prisma.user.findUnique);
        sinon.assert.notCalled(prisma.user.create);
      });

      it("should log a warning when a duplicate registration is attempted", async () => {
        prisma.user.findUnique.resolves({ id: "existing-user", email: "ali@gmail.com" });

        try {
          await authService.registerUser(validPayload);
        } catch (err) {
          // expected
        }

        sinon.assert.calledOnce(logger.warn);
      });
    });
    // password handling
    describe("password handling", () => {
      it("should throw 400 if password is too short", async () => {
        try {
          await authService.registerUser({ ...validPayload, password: "Aa1!" });
          expect.fail("Expected registerUser to throw");
        } catch (err) {
          expect(err.statusCode).to.equal(400);
          expect(err.message).to.equal(
            "Password must be at least 8 characters and include a number and a special character"
          );
        }
      });

      it("should throw 400 if password has no number", async () => {
        try {
          await authService.registerUser({ ...validPayload, password: "Password!!" });
          expect.fail("Expected registerUser to throw");
        } catch (err) {
          expect(err.statusCode).to.equal(400);
        }
      });

      it("should throw 400 if password has no special character", async () => {
        try {
          await authService.registerUser({ ...validPayload, password: "Password123" });
          expect.fail("Expected registerUser to throw");
        } catch (err) {
          expect(err.statusCode).to.equal(400);
        }
      });

      it("should not query the database when password format is invalid", async () => {
        try {
          await authService.registerUser({ ...validPayload, password: "weak" });
        } catch (err) {
          // expected
        }
        sinon.assert.notCalled(prisma.user.findUnique);
      });

      it("should hash the password before storing it (never store plain text)", async () => {
        prisma.user.findUnique.resolves(null);
        const hashStub = sinon.stub(bcrypt, "hash").resolves("$2b$10$hashedvalue");
        prisma.user.create.resolves({
          id: "user-1",
          firstName: "Ali",
          lastName: "Khan",
          email: "ali@gmail.com",
        });
        jwt.generateToken.returns("fake-token");

        await authService.registerUser(validPayload);

        sinon.assert.calledOnce(hashStub);
        sinon.assert.calledWith(hashStub, "Password123!", sinon.match.number);

        const createArgs = prisma.user.create.firstCall.args[0];
        expect(createArgs.data.password).to.equal("$2b$10$hashedvalue");
        expect(createArgs.data.password).to.not.equal(validPayload.password);
      });

      it("should use the configured salt rounds when hashing", async () => {
        prisma.user.findUnique.resolves(null);
        const hashStub = sinon.stub(bcrypt, "hash").resolves("hashed");
        prisma.user.create.resolves({ id: "user-1", email: "ali@gmail.com" });
        jwt.generateToken.returns("fake-token");

        await authService.registerUser(validPayload);

        const saltRoundsUsed = hashStub.firstCall.args[1];
        expect(saltRoundsUsed).to.be.a("number");
      });
    });
    // db error
    describe("database error", () => {
      it("should propagate with 500 if findUnique throws", async () => {
        prisma.user.findUnique.rejects(new Error("Connection refused"));

        try {
          await authService.registerUser(validPayload);
          expect.fail("Expected registerUser to throw");
        } catch (err) {
          expect(err.statusCode).to.equal(500);
          expect(err.message).to.equal("Connection refused");
        }
      });

      it("should propagate with 500 if user.create throws", async () => {
        prisma.user.findUnique.resolves(null);
        sinon.stub(bcrypt, "hash").resolves("hashed-password");
        prisma.user.create.rejects(new Error("Insert failed"));

        try {
          await authService.registerUser(validPayload);
          expect.fail("Expected registerUser to throw");
        } catch (err) {
          expect(err.statusCode).to.equal(500);
          expect(err.message).to.equal("Insert failed");
        }
      });

      it("should not overwrite an existing statusCode from a downstream error", async () => {
        const dbError = new Error("Unique constraint failed");
        dbError.statusCode = 409;
        prisma.user.findUnique.resolves(null);
        sinon.stub(bcrypt, "hash").resolves("hashed-password");
        prisma.user.create.rejects(dbError);

        try {
          await authService.registerUser(validPayload);
          expect.fail("Expected registerUser to throw");
        } catch (err) {
          expect(err.statusCode).to.equal(409);
        }
      });

      it("should not call jwt.generateToken if user creation fails", async () => {
        prisma.user.findUnique.resolves(null);
        sinon.stub(bcrypt, "hash").resolves("hashed-password");
        prisma.user.create.rejects(new Error("DB down"));

        try {
          await authService.registerUser(validPayload);
        } catch (err) {
          // expected
        }
        sinon.assert.notCalled(jwt.generateToken);
      });
    });
  });
  // login user
  describe("loginUser()", () => {
    const credentials = { email: "ali@gmail.com", password: "password123!" };
    it("should login successfully with valid credentials", async () => {
      prisma.user.findUnique.resolves({
        id: "123",
        firstName: "Ali",
        lastName: "Khan",
        email: "ali@gmail.com",
        password: "hashedPassword",
      });
      sinon.stub(bcrypt, "compare").resolves(true);
      jwt.generateToken.returns("fake-token");

      const result = await authService.loginUser(credentials);

      expect(result.user.email).to.equal("ali@gmail.com");
      expect(result.user).to.not.have.property("password");
      expect(result.token).to.equal("fake-token");

      sinon.assert.calledOnce(prisma.user.findUnique);
      sinon.assert.calledOnce(bcrypt.compare);
      sinon.assert.calledOnce(jwt.generateToken);
    });

    it("should log successful login", async () => {
      prisma.user.findUnique.resolves({
        id: "123",
        email: "ali@gmail.com",
        password: "hashedPassword",
      });
      sinon.stub(bcrypt, "compare").resolves(true);
      jwt.generateToken.returns("fake-token");

      await authService.loginUser(credentials);

      sinon.assert.calledOnce(logger.info);
    });
    // user doesn't exist
    describe("user doesn't exist", () => {
      it("should throw 401 for unknown email", async () => {
        prisma.user.findUnique.resolves(null);

        try {
          await authService.loginUser({ email: "nouser@gmail.com", password: "password123!" });
          expect.fail("Expected loginUser to throw");
        } catch (err) {
          expect(err.message).to.equal("Invalid email or password");
          expect(err.statusCode).to.equal(401);
        }
      });

      it("should not attempt password comparison for unknown email", async () => {
        prisma.user.findUnique.resolves(null);
        const compareStub = sinon.stub(bcrypt, "compare");

        try {
          await authService.loginUser({ email: "nouser@gmail.com", password: "password123!" });
        } catch (err) {
          // expected
        }

        sinon.assert.notCalled(compareStub);
      });

      it("should not generate a token for unknown email", async () => {
        prisma.user.findUnique.resolves(null);

        try {
          await authService.loginUser({ email: "nouser@gmail.com", password: "password123!" });
        } catch (err) {
          // expected
        }

        sinon.assert.notCalled(jwt.generateToken);
      });
    });
    // wrong password
    describe("wrong password", () => {
      it("should throw 401 for incorrect password", async () => {
        prisma.user.findUnique.resolves({
          id: "123",
          email: "ali@gmail.com",
          password: "hashedPassword",
        });
        sinon.stub(bcrypt, "compare").resolves(false);

        try {
          await authService.loginUser({ email: "ali@gmail.com", password: "wrongpassword" });
          expect.fail("Expected loginUser to throw");
        } catch (err) {
          expect(err.message).to.equal(" Invalid password, try again");
          expect(err.statusCode).to.equal(401);
        }

        sinon.assert.notCalled(jwt.generateToken);
      });

      it("should compare the plain password against the stored hash", async () => {
        prisma.user.findUnique.resolves({
          id: "123",
          email: "ali@gmail.com",
          password: "hashedPassword",
        });
        const compareStub = sinon.stub(bcrypt, "compare").resolves(false);

        try {
          await authService.loginUser({ email: "ali@gmail.com", password: "wrongpassword" });
        } catch (err) {
          // expected
        }

        sinon.assert.calledWith(compareStub, "wrongpassword", "hashedPassword");
      });
    });
    // missing credentials
    describe("missing credentials", () => {
      it("should throw 400 if email is missing", async () => {
        try {
          await authService.loginUser({ password: "password123!" });
          expect.fail("Expected loginUser to throw");
        } catch (err) {
          expect(err.statusCode).to.equal(400);
          expect(err.message).to.equal("Email and password both are required");
        }
        sinon.assert.notCalled(prisma.user.findUnique);
      });

      it("should throw 400 if password is missing", async () => {
        try {
          await authService.loginUser({ email: "ali@gmail.com" });
          expect.fail("Expected loginUser to throw");
        } catch (err) {
          expect(err.statusCode).to.equal(400);
          expect(err.message).to.equal("Email and password both are required");
        }
        sinon.assert.notCalled(prisma.user.findUnique);
      });

      it("should throw 400 if both are missing", async () => {
        try {
          await authService.loginUser({});
          expect.fail("Expected loginUser to throw");
        } catch (err) {
          expect(err.statusCode).to.equal(400);
        }
      });

      it("should throw 400 if email is an empty string", async () => {
        try {
          await authService.loginUser({ email: "", password: "password123!" });
          expect.fail("Expected loginUser to throw");
        } catch (err) {
          expect(err.statusCode).to.equal(400);
        }
      });
    });
    // db error
    describe("database error", () => {
      it("should propagate with 500 if findUnique throws", async () => {
        prisma.user.findUnique.rejects(new Error("Connection timeout"));

        try {
          await authService.loginUser(credentials);
          expect.fail("Expected loginUser to throw");
        } catch (err) {
          expect(err.statusCode).to.equal(500);
          expect(err.message).to.equal("Connection timeout");
        }
      });

      it("should propagate with 500 if bcrypt.compare throws unexpectedly", async () => {
        prisma.user.findUnique.resolves({
          id: "123",
          email: "ali@gmail.com",
          password: "hashedPassword",
        });
        sinon.stub(bcrypt, "compare").rejects(new Error("bcrypt internal error"));

        try {
          await authService.loginUser(credentials);
          expect.fail("Expected loginUser to throw");
        } catch (err) {
          expect(err.statusCode).to.equal(500);
          expect(err.message).to.equal("bcrypt internal error");
        }
      });

      it("should not overwrite an existing statusCode from a downstream error", async () => {
        const dbError = new Error("Custom DB error");
        dbError.statusCode = 503;
        prisma.user.findUnique.rejects(dbError);

        try {
          await authService.loginUser(credentials);
          expect.fail("Expected loginUser to throw");
        } catch (err) {
          expect(err.statusCode).to.equal(503);
        }
      });
    });
  });
  // logout user
  describe("logoutUser()", () => {
    it("should return a success message", async () => {
      const result = await authService.logoutUser({ id: "user-1" });

      expect(result.success).to.equal(true);
      expect(result.message).to.equal("User logged out successfully");
    });

    it("should log the logout event", async () => {
      await authService.logoutUser({ id: "user-1" });
      sinon.assert.calledOnce(logger.info);
    });
  });
  describe("getMe()", () => {
    it("should return the user profile when found", async () => {
      prisma.user.findUnique.resolves({
        id: "user-1",
        firstName: "Ali",
        lastName: "Khan",
        email: "ali@gmail.com",
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      const result = await authService.getMe("user-1");

      expect(result.id).to.equal("user-1");
      expect(result).to.not.have.property("password");
    });

    it("should throw 404 if user not found", async () => {
      prisma.user.findUnique.resolves(null);

      try {
        await authService.getMe("bad-id");
        expect.fail("Expected getMe to throw");
      } catch (err) {
        expect(err.statusCode).to.equal(404);
        expect(err.message).to.equal("User not found");
      }
    });

    it("should propagate with 500 on database error", async () => {
      prisma.user.findUnique.rejects(new Error("DB unreachable"));

      try {
        await authService.getMe("user-1");
        expect.fail("Expected getMe to throw");
      } catch (err) {
        expect(err.statusCode).to.equal(500);
      }
    });
  });
});