import "@testing-library/jest-dom";
import { render, screen } from "@testing-library/react";
import AppRoutes from "../routes/AppRoutes";
import { useAuth } from "../context/AuthContext";

jest.mock("../context/AuthContext");

// Mock the page components so this test only exercises routing logic,
// not the internals of Login/Dashboard (both already have their own tests).
jest.mock("../pages/Login", () => () => <div data-testid="login-page">Login Page</div>);
jest.mock("../pages/Dashboard", () => () => <div data-testid="dashboard-page">Dashboard Page</div>);

function setLocation(path) {
  window.history.pushState({}, "", path);
}

describe("AppRoutes", () => {
  afterEach(() => {
    window.history.pushState({}, "", "/");
  });

  it("renders nothing while auth state is loading", () => {
    useAuth.mockReturnValue({ isAuthenticated: false, loading: true });

    const { container } = render(<AppRoutes />);

    expect(container).toBeEmptyDOMElement();
  });

  it("redirects an unauthenticated user from '/' to '/login'", () => {
    useAuth.mockReturnValue({ isAuthenticated: false, loading: false });
    setLocation("/");

    render(<AppRoutes />);

    expect(screen.getByTestId("login-page")).toBeInTheDocument();
  });

  it("redirects an authenticated user from '/' to '/dashboard'", () => {
    useAuth.mockReturnValue({ isAuthenticated: true, loading: false });
    setLocation("/");

    render(<AppRoutes />);

    expect(screen.getByTestId("dashboard-page")).toBeInTheDocument();
  });

  it("shows the login page at '/login' when not authenticated", () => {
    useAuth.mockReturnValue({ isAuthenticated: false, loading: false });
    setLocation("/login");

    render(<AppRoutes />);

    expect(screen.getByTestId("login-page")).toBeInTheDocument();
  });

  it("redirects away from '/login' to '/dashboard' when already authenticated", () => {
    useAuth.mockReturnValue({ isAuthenticated: true, loading: false });
    setLocation("/login");

    render(<AppRoutes />);

    expect(screen.getByTestId("dashboard-page")).toBeInTheDocument();
    expect(screen.queryByTestId("login-page")).not.toBeInTheDocument();
  });

  it("shows the dashboard at '/dashboard' when authenticated", () => {
    useAuth.mockReturnValue({ isAuthenticated: true, loading: false });
    setLocation("/dashboard");

    render(<AppRoutes />);

    expect(screen.getByTestId("dashboard-page")).toBeInTheDocument();
  });

  it("redirects away from '/dashboard' to '/login' when not authenticated", () => {
    useAuth.mockReturnValue({ isAuthenticated: false, loading: false });
    setLocation("/dashboard");

    render(<AppRoutes />);

    expect(screen.getByTestId("login-page")).toBeInTheDocument();
    expect(screen.queryByTestId("dashboard-page")).not.toBeInTheDocument();
  });
});