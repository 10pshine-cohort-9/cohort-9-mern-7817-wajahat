import "@testing-library/jest-dom";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import Profile from "../pages/Profile";
import { useAuth } from "../context/AuthContext";

jest.mock("../context/AuthContext");

const mockNavigate = jest.fn();
jest.mock("react-router-dom", () => ({
  ...jest.requireActual("react-router-dom"),
  useNavigate: () => mockNavigate,
}));

function renderProfile(onClose = jest.fn()) {
  return render(
    <MemoryRouter>
      <Profile onClose={onClose} />
    </MemoryRouter>
  );
}

describe("Profile", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("renders the user's full name and initial", () => {
    useAuth.mockReturnValue({
      user: { firstName: "Ali", lastName: "Khan", email: "ali@gmail.com" },
      logout: jest.fn(),
    });

    renderProfile();

    expect(screen.getAllByText("Ali Khan").length).toBeGreaterThan(0);
    expect(screen.getByText("A")).toBeInTheDocument();
  });

  it("renders the user's email", () => {
    useAuth.mockReturnValue({
      user: { firstName: "Ali", lastName: "Khan", email: "ali@gmail.com" },
      logout: jest.fn(),
    });

    renderProfile();

    expect(screen.getByText("ali@gmail.com")).toBeInTheDocument();
  });

  it('falls back to "User" and "?" when there is no user', () => {
    useAuth.mockReturnValue({ user: null, logout: jest.fn() });

    renderProfile();

    expect(screen.getAllByText("User").length).toBeGreaterThan(0);
    expect(screen.getByText("?")).toBeInTheDocument();
  });

  it('shows "No email available" when the user has no email', () => {
    useAuth.mockReturnValue({
      user: { firstName: "Ali", lastName: "Khan" },
      logout: jest.fn(),
    });

    renderProfile();

    expect(screen.getByText("No email available")).toBeInTheDocument();
  });

  it("trims whitespace when only a first name is present", () => {
    useAuth.mockReturnValue({
      user: { firstName: "Ali", email: "ali@gmail.com" },
      logout: jest.fn(),
    });

    renderProfile();

    expect(screen.getAllByText("Ali").length).toBeGreaterThan(0);
  });

  it("calls onClose when the back arrow button is clicked", async () => {
    const user = userEvent.setup();
    const onClose = jest.fn();
    useAuth.mockReturnValue({
      user: { firstName: "Ali", lastName: "Khan", email: "ali@gmail.com" },
      logout: jest.fn(),
    });

    renderProfile(onClose);

    const closeButtons = screen.getAllByLabelText("Close profile");
    await user.click(closeButtons[0]);

    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it("calls onClose when the backdrop is clicked", async () => {
    const user = userEvent.setup();
    const onClose = jest.fn();
    useAuth.mockReturnValue({
      user: { firstName: "Ali", lastName: "Khan", email: "ali@gmail.com" },
      logout: jest.fn(),
    });

    renderProfile(onClose);

    const closeButtons = screen.getAllByLabelText("Close profile");
    await user.click(closeButtons[1]);

    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it("calls logout and navigates to /login when the logout button is clicked", async () => {
    const user = userEvent.setup();
    const logout = jest.fn().mockResolvedValue();
    useAuth.mockReturnValue({
      user: { firstName: "Ali", lastName: "Khan", email: "ali@gmail.com" },
      logout,
    });

    renderProfile();

    await user.click(screen.getByText("Log out"));

    expect(logout).toHaveBeenCalledTimes(1);
    expect(mockNavigate).toHaveBeenCalledWith("/login", { replace: true });
  });

  it("waits for logout to resolve before navigating", async () => {
    const user = userEvent.setup();
    let resolveLogout;
    const logout = jest.fn(
      () => new Promise((resolve) => (resolveLogout = resolve))
    );
    useAuth.mockReturnValue({
      user: { firstName: "Ali", lastName: "Khan", email: "ali@gmail.com" },
      logout,
    });

    renderProfile();

    const clickPromise = user.click(screen.getByText("Log out"));
    await waitFor(() => expect(logout).toHaveBeenCalledTimes(1));
    expect(mockNavigate).not.toHaveBeenCalled();

    resolveLogout();
    await clickPromise;

    expect(mockNavigate).toHaveBeenCalledWith("/login", { replace: true });
  });
});