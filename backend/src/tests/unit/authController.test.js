require("dotenv").config();

const { expect } = require("chai");
const sinon = require("sinon");
const authService = require("../../services/auth.service");
const authController = require("../../controllers/authController");

describe("authController", () => {
  let req, res, next;

  beforeEach(() => {
    req = { body: {}, params: {}, user: null };
    res = {
      status: sinon.stub().returnsThis(),
      json: sinon.stub().returnsThis(),
      cookie: sinon.stub().returnsThis(),
    };
    next = sinon.stub();
  });

  afterEach(() => {
    sinon.restore();
  });
  //register
  describe("register()", () => {
    it("should respond 201 with the registered user on success", async () => {
      req.body = {
        firstName: "Ali",
        lastName: "Khan",
        email: "ali@gmail.com",
        password: "Password123!",
      };
      const serviceResult = {
        user: { id: "user-1", email: "ali@gmail.com" },
        token: "fake-token",
      };
      sinon.stub(authService, "registerUser").resolves(serviceResult);

      await authController.register(req, res, next);

      sinon.assert.calledOnceWithExactly(authService.registerUser, req.body);
      sinon.assert.calledOnceWithExactly(res.status, 201);
      sinon.assert.calledOnceWithMatch(res.json, {
        success: true,
        message: "User registered successfully",
        data: serviceResult,
      });
      sinon.assert.notCalled(next);
    });

    it("should call next(error) when registerUser throws", async () => {
      const error = new Error("Email already registered");
      error.statusCode = 409;
      sinon.stub(authService, "registerUser").rejects(error);

      await authController.register(req, res, next);

      sinon.assert.calledOnceWithExactly(next, error);
      sinon.assert.notCalled(res.status);
      sinon.assert.notCalled(res.json);
    });
  });
  //login
  describe("login()", () => {
    it("should set an httpOnly cookie and respond 200 with the user on success", async () => {
      req.body = { email: "ali@gmail.com", password: "Password123!" };
      const serviceResult = {
        user: { id: "user-1", email: "ali@gmail.com" },
        token: "fake-token",
      };
      sinon.stub(authService, "loginUser").resolves(serviceResult);

      await authController.login(req, res, next);

      sinon.assert.calledOnceWithExactly(authService.loginUser, req.body);
      sinon.assert.calledOnce(res.cookie);

      const [cookieName, cookieValue, cookieOptions] = res.cookie.firstCall.args;
      expect(cookieName).to.equal("token");
      expect(cookieValue).to.equal("fake-token");
      expect(cookieOptions).to.deep.equal({
        httpOnly: true,
        secure: false,
        sameSite: "lax",
        maxAge: 7 * 24 * 60 * 60 * 1000,
      });

      sinon.assert.calledOnceWithExactly(res.status, 200);
      sinon.assert.calledOnceWithMatch(res.json, {
        success: true,
        message: "user logged in successfully",
        data: { user: serviceResult.user },
      });
    });

    it("should not leak the raw token in the JSON response body", async () => {
      req.body = { email: "ali@gmail.com", password: "Password123!" };
      sinon.stub(authService, "loginUser").resolves({
        user: { id: "user-1", email: "ali@gmail.com" },
        token: "super-secret-token",
      });

      await authController.login(req, res, next);

      const jsonPayload = res.json.firstCall.args[0];
      expect(jsonPayload.data).to.not.have.property("token");
      expect(JSON.stringify(jsonPayload)).to.not.include("super-secret-token");
    });

    it("should call next(error) and not set a cookie when loginUser throws", async () => {
      const error = new Error("Invalid email or password");
      error.statusCode = 401;
      sinon.stub(authService, "loginUser").rejects(error);

      await authController.login(req, res, next);

      sinon.assert.calledOnceWithExactly(next, error);
      sinon.assert.notCalled(res.cookie);
      sinon.assert.notCalled(res.status);
    });
  });
//getme
  describe("getMe()", () => {
    it("should respond 200 with the user profile on success", async () => {
      req.user = { id: "user-1" };
      const profile = { id: "user-1", email: "ali@gmail.com" };
      sinon.stub(authService, "getMe").resolves(profile);

      await authController.getMe(req, res, next);

      sinon.assert.calledOnceWithExactly(authService.getMe, "user-1");
      sinon.assert.calledOnceWithExactly(res.status, 200);
      sinon.assert.calledOnceWithMatch(res.json, {
        success: true,
        message: "profile fetched",
        data: profile,
      });
    });

    it("should call next(error) when getMe throws", async () => {
      req.user = { id: "bad-id" };
      const error = new Error("User not found");
      error.statusCode = 404;
      sinon.stub(authService, "getMe").rejects(error);

      await authController.getMe(req, res, next);

      sinon.assert.calledOnceWithExactly(next, error);
      sinon.assert.notCalled(res.status);
    });

    it("should call next(error) if req.user is missing (no id to read)", async () => {
      req.user = null;

      await authController.getMe(req, res, next);

      sinon.assert.calledOnce(next);
      const errArg = next.firstCall.args[0];
      expect(errArg).to.be.instanceOf(Error);
    });
  });

  describe("logout()", () => {
    it("should respond 200 with the service result on success", async () => {
      req.user = { id: "user-1" };
      const serviceResult = { success: true, message: "User logged out successfully" };
      sinon.stub(authService, "logoutUser").resolves(serviceResult);

      await authController.logout(req, res, next);

      sinon.assert.calledOnceWithExactly(authService.logoutUser, req.user);
      sinon.assert.calledOnceWithExactly(res.status, 200);
      sinon.assert.calledOnceWithExactly(res.json, serviceResult);
    });

    it("should call next(error) when logoutUser throws", async () => {
      req.user = { id: "user-1" };
      const error = new Error("Something went wrong");
      sinon.stub(authService, "logoutUser").rejects(error);

      await authController.logout(req, res, next);

      sinon.assert.calledOnceWithExactly(next, error);
      sinon.assert.notCalled(res.status);
    });
  });
});