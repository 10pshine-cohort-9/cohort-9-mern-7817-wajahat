require("dotenv").config();

const { expect } = require("chai");
const sinon = require("sinon");
const bcrypt = require("bcrypt");

const prismaPath = require.resolve("../../config/prisma");
const jwtPath = require.resolve("../../utils/jwt");
const authServicePath = require.resolve("../../services/auth.service");

describe("loginUser()", () => {
  let prismaStub, jwtStub, authService;

  beforeEach(() => {
    prismaStub = {
      user: {
        findUnique: sinon.stub(),
      },
    };

    jwtStub = {
      generateToken: sinon.stub(),
      verifyToken: sinon.stub(),
    };

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

    delete require.cache[authServicePath];
    authService = require("../../services/auth.service");
  });

  afterEach(() => {
    sinon.restore();
    delete require.cache[prismaPath];
    delete require.cache[jwtPath];
    delete require.cache[authServicePath];
  });

  it("should login successfully", async () => {
    prismaStub.user.findUnique.resolves({
      id: "123",
      firstName: "Ali",
      lastName: "Khan",
      email: "ali@gmail.com",
      password: "hashedPassword",
    });

    sinon.stub(bcrypt, "compare").resolves(true);

    jwtStub.generateToken.returns("fake-token");

    const result = await authService.loginUser({
      email: "ali@gmail.com",
      password: "password123!",
    });

    expect(result.user.email).to.equal("ali@gmail.com");
    expect(result.token).to.equal("fake-token");

    sinon.assert.calledOnce(prismaStub.user.findUnique);
    sinon.assert.calledOnce(bcrypt.compare);
    sinon.assert.calledOnce(jwtStub.generateToken);
  });

  it("should reject invalid password", async () => {
    prismaStub.user.findUnique.resolves({
      id: "123",
      email: "ali@gmail.com",
      password: "hashedPassword",
    });

    sinon.stub(bcrypt, "compare").resolves(false);

    try {
      await authService.loginUser({
        email: "ali@gmail.com",
        password: "wrongpassword",
      });
      expect.fail("Expected loginUser to throw");
    } catch (err) {
      expect(err.message).to.equal(" Invalid password, try again");
      expect(err.statusCode).to.equal(401);
    }

    sinon.assert.notCalled(jwtStub.generateToken);
  });

  it("should reject unknown email", async () => {
    prismaStub.user.findUnique.resolves(null);

    try {
      await authService.loginUser({
        email: "nouser@gmail.com",
        password: "password123!",
      });
      expect.fail("Expected loginUser to throw");
    } catch (err) {
      expect(err.message).to.equal("Invalid email or password");
      expect(err.statusCode).to.equal(401);
    }
  });
});