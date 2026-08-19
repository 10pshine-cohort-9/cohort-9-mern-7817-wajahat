import "@testing-library/jest-dom";
import api from "../api/axios";
import {
  registerUser,
  loginUser,
  getCurrentUser,
  logoutUser,
} from "../services/authService";
jest.mock("../api/axios.js");
describe("authService", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    localStorage.clear();
  });
  describe("registerUser", () => {
    it("stores the token when response has token at data.data.token", async () => {
      api.post.mockResolvedValue({
        data: { data: { token: "abc123" } },
      });
      const response = await registerUser({ email: "a@a.com", password: "pw" });
      expect(api.post).toHaveBeenCalledWith("/auth/register", {
        email: "a@a.com",
        password: "pw",
      });
      expect(localStorage.getItem("token")).toBe("abc123");
      expect(response.data.data.token).toBe("abc123");
    });
    it("stores the token when response has token at data.token (fallback)", async () => {
      api.post.mockResolvedValue({
        data: { token: "xyz789" },
      });
      await registerUser({ email: "b@b.com", password: "pw" });
      expect(localStorage.getItem("token")).toBe("xyz789");
    });
    it("does not set a token when none is returned", async () => {
      api.post.mockResolvedValue({ data: {} });
      await registerUser({ email: "c@c.com", password: "pw" });
      expect(localStorage.getItem("token")).toBeNull();
    });
    it("propagates errors from the API call", async () => {
      api.post.mockRejectedValue(new Error("Network error"));
      await expect(
        registerUser({ email: "bad@a.com", password: "pw" })
      ).rejects.toThrow("Network error");
    });
  });
  describe("loginUser", () => {
    it("returns the response when a user is present", async () => {
      const mockResponse = {
        data: { data: { user: { id: 1, email: "a@a.com" } } },
      };
      api.post.mockResolvedValue(mockResponse);
      const response = await loginUser({ email: "a@a.com", password: "pw" });
      expect(api.post).toHaveBeenCalledWith("/auth/login", {
        email: "a@a.com",
        password: "pw",
      });
      expect(response).toBe(mockResponse);
    });
    it("throws when no user is present in the response", async () => {
      api.post.mockResolvedValue({ data: {} });
      await expect(
        loginUser({ email: "a@a.com", password: "pw" })
      ).rejects.toThrow("Invalid login response.");
    });
    it("propagates errors from the API call", async () => {
      api.post.mockRejectedValue(new Error("Invalid credentials"));
      await expect(
        loginUser({ email: "a@a.com", password: "wrong" })
      ).rejects.toThrow("Invalid credentials");
    });
  });
  describe("getCurrentUser", () => {
    it("calls GET /auth/me", async () => {
      api.get.mockResolvedValue({ data: { data: { user: { id: 1 } } } });
      await getCurrentUser();
      expect(api.get).toHaveBeenCalledWith("/auth/me");
    });
  });
    describe("logoutUser", () => {
    it("calls POST /auth/logout", async () => {
      api.post.mockResolvedValue({ data: { message: "logged out" } });
      await logoutUser();
      expect(api.post).toHaveBeenCalledWith("/auth/logout");
    });
    it("propagates the error when the logout call fails", async () => {
      api.post.mockRejectedValue(new Error("Server error"));
      await expect(logoutUser()).rejects.toThrow("Server error");
    });
  });
});