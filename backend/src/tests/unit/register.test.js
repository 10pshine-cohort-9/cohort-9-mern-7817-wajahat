require("dotenv").config();

const { expect } = require("chai");
const sinon = require("sinon");
const bcrypt = require("bcrypt");

const prismaPath = require.resolve("../../config/prisma");
const jwtPath = require.resolve("../../utils/jwt");
const authServicePath = require.resolve("../../services/auth.service");

describe("registerUser()", function () {
  let prismaStub, jwtStub, authService;

  beforeEach(function () {
    prismaStub = {
      user: {
        findUnique: sinon.stub(),
        create: sinon.stub(),
      },
    };

    jwtStub = {
      generateToken: sinon.stub(),
      verifyToken: sinon.stub(),
    };

    // Inject fakes into the module cache
    require.cache[prismaPath] = {
      id: prismaPath,
      filename: prismaPath,
      loaded: true,
      exports: prismaStub,
    };

    require.cache[jwtPath] = {
      id: jwtPath,
      filename: jwtPath,
      loaded: true,
      exports: jwtStub,
    };

    // Force auth.service to be reloaded so it picks up the fakes above
    delete require.cache[authServicePath];
    authService = require("../../services/auth.service");
  });

  afterEach(function () {
    sinon.restore();
    // Clean up cache overrides so other test files get the real modules
    delete require.cache[prismaPath];
    delete require.cache[jwtPath];
    delete require.cache[authServicePath];
  });

  it("should register a new user successfully", async function () {
    prismaStub.user.findUnique.resolves(null);
    sinon.stub(bcrypt, "hash").resolves("hashedPassword");
    prismaStub.user.create.resolves({
      id: "123",
      firstName: "Ali",
      lastName: null,
      email: "alikhan@gmail.com",
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    jwtStub.generateToken.returns("fake-jwt-token");
    try{
    const result = await authService.registerUser({
      firstName: "Ali",
      lastName: null,
      email: "alikhan@gmail.com",
      password: "password123!",
    });

    expect(result).to.have.property("user");
    expect(result).to.have.property("token");
    expect(result.user.id).to.equal("123");
    expect(result.user.firstName).to.equal("Ali");
    expect(result.user.email).to.equal("alikhan@gmail.com");
    expect(result.token).to.equal("fake-jwt-token");

    sinon.assert.calledOnce(prismaStub.user.findUnique);
    sinon.assert.calledOnce(bcrypt.hash);
    sinon.assert.calledOnce(prismaStub.user.create);
    sinon.assert.calledOnce(jwtStub.generateToken);
  }
  catch(err){
    throw err
  }
  });

  it("should reject if email already exists", async function () {
    prismaStub.user.findUnique.resolves({ id: "999", email: "alikhan@gmail.com" });

    try {
      await authService.registerUser({
        firstName: "Ali",
        email: "alikhan@gmail.com",
        password: "password123!",
      });
      expect.fail("Expected registerUser to throw");
    } catch (err) {
      expect(err.message).to.equal("Email already registered");
      expect(err.statusCode).to.equal(409);
    }

    sinon.assert.notCalled(prismaStub.user.create);
  });
});