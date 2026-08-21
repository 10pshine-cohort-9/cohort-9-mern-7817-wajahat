import "@testing-library/jest-dom";
import { render, screen, waitFor, act } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { AuthProvider, useAuth } from "../context/AuthContext";
import { getCurrentUser, logoutUser } from "../services/authService";

jest.mock("../services/authService");

// Small test consumer that exposes context values on screen so we can assert on them
function TestConsumer() {
  const { user, isAuthenticated, loading, login, logout } = useAuth();

  return (
    <div>
      <div data-testid="loading">{loading ? "loading" : "loaded"}</div>
      <div data-testid="authenticated">{isAuthenticated ? "yes" : "no"}</div>
      <div data-testid="user-email">{user?.email || "no-user"}</div>
      <button onClick={() => login({ email: "new@user.com" })}>Login</button>
      <button onClick={() => logout()}>Logout</button>
    </div>
  );
}

function renderWithProvider() {
  return render(
    <AuthProvider>
      <TestConsumer />
    </AuthProvider>
  );
}

describe("AuthContext", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    localStorage.clear();
    jest.spyOn(console, "error").mockImplementation(() => {});
  });

  afterEach(() => {
    console.error.mockRestore();
  });

  it("starts in a loading state and finishes loading with no token", async () => {
    renderWithProvider();

    await waitFor(() => expect(screen.getByTestId("loading")).toHaveTextContent("loaded"));

    expect(screen.getByTestId("authenticated")).toHaveTextContent("no");
    expect(screen.getByTestId("user-email")).toHaveTextContent("no-user");
    expect(getCurrentUser).not.toHaveBeenCalled();
  });

  it("restores the user from a stored token on mount", async () => {
    localStorage.setItem("token", "abc123");
    getCurrentUser.mockResolvedValue({
      data: { data: { user: { email: "restored@user.com" } } },
    });

    renderWithProvider();

    await waitFor(() =>
      expect(screen.getByTestId("user-email")).toHaveTextContent("restored@user.com")
    );
    expect(screen.getByTestId("authenticated")).toHaveTextContent("yes");
    expect(getCurrentUser).toHaveBeenCalledTimes(1);
  });

  it("falls back to response.data.user when response.data.data.user is absent", async () => {
    localStorage.setItem("token", "abc123");
    getCurrentUser.mockResolvedValue({
      data: { user: { email: "fallback@user.com" } },
    });

    renderWithProvider();

    await waitFor(() =>
      expect(screen.getByTestId("user-email")).toHaveTextContent("fallback@user.com")
    );
  });

  it("falls back to response.data.data when neither nested user field is present", async () => {
    localStorage.setItem("token", "abc123");
    getCurrentUser.mockResolvedValue({
      data: { data: { email: "flat@user.com" } },
    });

    renderWithProvider();

    await waitFor(() =>
      expect(screen.getByTestId("user-email")).toHaveTextContent("flat@user.com")
    );
  });

  it("clears the token and logs out when restoring the user fails", async () => {
    localStorage.setItem("token", "expired-token");
    getCurrentUser.mockRejectedValue(new Error("Unauthorized"));

    renderWithProvider();

    await waitFor(() => expect(screen.getByTestId("loading")).toHaveTextContent("loaded"));

    expect(screen.getByTestId("authenticated")).toHaveTextContent("no");
    expect(localStorage.getItem("token")).toBeNull();
    expect(console.error).toHaveBeenCalled();
  });

  it("login() sets the user and flips isAuthenticated to true", async () => {
    const user = userEvent.setup();
    renderWithProvider();

    await waitFor(() => expect(screen.getByTestId("loading")).toHaveTextContent("loaded"));

    await user.click(screen.getByText("Login"));

    expect(screen.getByTestId("user-email")).toHaveTextContent("new@user.com");
    expect(screen.getByTestId("authenticated")).toHaveTextContent("yes");
  });

  it("logout() calls logoutUser and clears the user on success", async () => {
    const user = userEvent.setup();
    logoutUser.mockResolvedValue({ data: { message: "logged out" } });
    renderWithProvider();

    await waitFor(() => expect(screen.getByTestId("loading")).toHaveTextContent("loaded"));
    await user.click(screen.getByText("Login"));
    expect(screen.getByTestId("authenticated")).toHaveTextContent("yes");

    await user.click(screen.getByText("Logout"));

    await waitFor(() => expect(screen.getByTestId("authenticated")).toHaveTextContent("no"));
    expect(logoutUser).toHaveBeenCalledTimes(1);
  });

  it("logout() still clears the user even if logoutUser rejects", async () => {
    const user = userEvent.setup();
    logoutUser.mockRejectedValue(new Error("Network error"));
    renderWithProvider();

    await waitFor(() => expect(screen.getByTestId("loading")).toHaveTextContent("loaded"));
    await user.click(screen.getByText("Login"));

    await user.click(screen.getByText("Logout"));

    await waitFor(() => expect(screen.getByTestId("authenticated")).toHaveTextContent("no"));
    expect(console.error).toHaveBeenCalled();
  });
});