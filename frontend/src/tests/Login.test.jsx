import "@testing-library/jest-dom";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import Login from "../pages/Login";
import { useAuth } from "../context/AuthContext";
import { loginUser, registerUser } from "../services/authService";

jest.mock("../context/AuthContext");
jest.mock("../services/authService");

const mockNavigate = jest.fn();
jest.mock("react-router-dom", () => ({
  useNavigate: () => mockNavigate,
}));

describe("Login page", () => {
  const mockLogin = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    useAuth.mockReturnValue({ login: mockLogin });
    jest.spyOn(console, "log").mockImplementation(() => {});
    jest.spyOn(console, "error").mockImplementation(() => {});
  });

  afterEach(() => {
    console.log.mockRestore();
    console.error.mockRestore();
  });

  // ==========================================================================
  // LOGIN — valid credentials
  // ==========================================================================
  describe("login: valid credentials", () => {
    it("logs in successfully and navigates to the dashboard", async () => {
      const user = userEvent.setup();
      loginUser.mockResolvedValue({
        data: {
          message: "Welcome back",
          data: { user: { id: "1", email: "ali@gmail.com" } },
        },
      });

      render(<Login />);

      await user.type(screen.getByPlaceholderText("Email address"), "ali@gmail.com");
      await user.type(screen.getByPlaceholderText("Password"), "Password123!");
      await user.click(screen.getByRole("button", { name: "Login" }));

      await waitFor(() => expect(mockLogin).toHaveBeenCalledWith({ id: "1", email: "ali@gmail.com" }));
      expect(mockNavigate).toHaveBeenCalledWith("/dashboard");
      expect(await screen.findByText("Welcome back")).toBeInTheDocument();
    });

    it("shows a default success message when the API returns none", async () => {
      const user = userEvent.setup();
      loginUser.mockResolvedValue({
        data: { data: { user: { id: "1", email: "ali@gmail.com" } } },
      });

      render(<Login />);

      await user.type(screen.getByPlaceholderText("Email address"), "ali@gmail.com");
      await user.type(screen.getByPlaceholderText("Password"), "Password123!");
      await user.click(screen.getByRole("button", { name: "Login" }));

      expect(await screen.findByText("Login successful")).toBeInTheDocument();
    });
  });

  // ==========================================================================
  // LOGIN — user doesn't exist / wrong password (service rejects)
  // ==========================================================================
  describe("login: invalid credentials", () => {
    it("shows a generic error when loginUser rejects (wrong password / unknown user)", async () => {
      const user = userEvent.setup();
      loginUser.mockRejectedValue(new Error("Invalid credentials"));

      render(<Login />);

      await user.type(screen.getByPlaceholderText("Email address"), "ali@gmail.com");
      await user.type(screen.getByPlaceholderText("Password"), "wrongpass");
      await user.click(screen.getByRole("button", { name: "Login" }));

      expect(await screen.findByText("Invalid email or password")).toBeInTheDocument();
      expect(mockLogin).not.toHaveBeenCalled();
      expect(mockNavigate).not.toHaveBeenCalled();
    });

    it("shows a generic error when the response has no user (malformed response)", async () => {
      const user = userEvent.setup();
      loginUser.mockResolvedValue({ data: {} });

      render(<Login />);

      await user.type(screen.getByPlaceholderText("Email address"), "ali@gmail.com");
      await user.type(screen.getByPlaceholderText("Password"), "Password123!");
      await user.click(screen.getByRole("button", { name: "Login" }));

      expect(await screen.findByText("Invalid email or password")).toBeInTheDocument();
      expect(mockLogin).not.toHaveBeenCalled();
    });
  });

  // ==========================================================================
  // LOGIN — missing credentials
  // ==========================================================================
  describe("login: missing credentials", () => {
    it("shows a validation error and does not call loginUser when email is empty", async () => {
      const user = userEvent.setup();

      render(<Login />);

      await user.type(screen.getByPlaceholderText("Password"), "Password123!");
      await user.click(screen.getByRole("button", { name: "Login" }));

      expect(await screen.findByText("Email and password are required")).toBeInTheDocument();
      expect(loginUser).not.toHaveBeenCalled();
    });

    it("shows a validation error and does not call loginUser when password is empty", async () => {
      const user = userEvent.setup();

      render(<Login />);

      await user.type(screen.getByPlaceholderText("Email address"), "ali@gmail.com");
      await user.click(screen.getByRole("button", { name: "Login" }));

      expect(await screen.findByText("Email and password are required")).toBeInTheDocument();
      expect(loginUser).not.toHaveBeenCalled();
    });

    it("shows a validation error when both fields are empty", async () => {
      const user = userEvent.setup();

      render(<Login />);

      await user.click(screen.getByRole("button", { name: "Login" }));

      expect(await screen.findByText("Email and password are required")).toBeInTheDocument();
      expect(loginUser).not.toHaveBeenCalled();
    });
  });

  // ==========================================================================
  // LOGIN — field interaction / error clearing
  // ==========================================================================
  describe("login: field interaction", () => {
    it("clears the error message as soon as the user edits a field", async () => {
      const user = userEvent.setup();

      render(<Login />);

      await user.click(screen.getByRole("button", { name: "Login" }));
      expect(await screen.findByText("Email and password are required")).toBeInTheDocument();

      await user.type(screen.getByPlaceholderText("Email address"), "a");

      expect(screen.queryByText("Email and password are required")).not.toBeInTheDocument();
    });

    it("cancel button clears the typed fields", async () => {
      const user = userEvent.setup();

      render(<Login />);

      const emailInput = screen.getByPlaceholderText("Email address");
      await user.type(emailInput, "ali@gmail.com");
      expect(emailInput).toHaveValue("ali@gmail.com");

      await user.click(screen.getByRole("button", { name: "Cancel" }));

      expect(emailInput).toHaveValue("");
    });
  });

  // ==========================================================================
  // SIGNUP — valid signup
  // ==========================================================================
  describe("signup: valid signup", () => {
    async function switchToSignup(user) {
      await user.click(screen.getByRole("button", { name: "Sign up" }));
    }

    it("registers successfully, switches back to login, and shows a success message", async () => {
      const user = userEvent.setup();
      registerUser.mockResolvedValue({ data: { message: "Welcome to Noto!" } });

      render(<Login />);
      await switchToSignup(user);

      await user.type(screen.getByPlaceholderText("First name"), "Ali");
      await user.type(screen.getByPlaceholderText("Last name"), "Khan");
      await user.type(screen.getByPlaceholderText("Email address"), "ali@gmail.com");
      await user.type(screen.getByPlaceholderText("Password"), "Password123!");
      await user.click(screen.getByRole("button", { name: "Sign Up" }));

      expect(await screen.findByText("Welcome to Noto!")).toBeInTheDocument();
      // switched back to login view
      expect(screen.getByRole("button", { name: "Login" })).toBeInTheDocument();
      expect(screen.queryByPlaceholderText("First name")).not.toBeInTheDocument();
    });

    it("shows a default success message when the API returns none", async () => {
      const user = userEvent.setup();
      registerUser.mockResolvedValue({ data: {} });

      render(<Login />);
      await switchToSignup(user);

      await user.type(screen.getByPlaceholderText("First name"), "Ali");
      await user.type(screen.getByPlaceholderText("Last name"), "Khan");
      await user.type(screen.getByPlaceholderText("Email address"), "ali@gmail.com");
      await user.type(screen.getByPlaceholderText("Password"), "Password123!");
      await user.click(screen.getByRole("button", { name: "Sign Up" }));

      expect(
        await screen.findByText("Account created successfully. Please login.")
      ).toBeInTheDocument();
    });
  });

  // ==========================================================================
  // SIGNUP — missing fields
  // ==========================================================================
  describe("signup: missing fields", () => {
    async function switchToSignup(user) {
      await user.click(screen.getByRole("button", { name: "Sign up" }));
    }

    it("shows a validation error when required fields are missing", async () => {
      const user = userEvent.setup();

      render(<Login />);
      await switchToSignup(user);

      await user.type(screen.getByPlaceholderText("First name"), "Ali");
      // lastName, email, password left blank
      await user.click(screen.getByRole("button", { name: "Sign Up" }));

      expect(await screen.findByText("Please fill in all fields")).toBeInTheDocument();
      expect(registerUser).not.toHaveBeenCalled();
    });

    it("shows a validation error when all fields are empty", async () => {
      const user = userEvent.setup();

      render(<Login />);
      await switchToSignup(user);

      await user.click(screen.getByRole("button", { name: "Sign Up" }));

      expect(await screen.findByText("Please fill in all fields")).toBeInTheDocument();
      expect(registerUser).not.toHaveBeenCalled();
    });
  });

  // ==========================================================================
  // SIGNUP — invalid email / duplicate email / server-side rejection
  // ==========================================================================
  describe("signup: server-side rejection", () => {
    async function switchToSignup(user) {
      await user.click(screen.getByRole("button", { name: "Sign up" }));
    }

    async function fillSignupForm(user) {
      await user.type(screen.getByPlaceholderText("First name"), "Ali");
      await user.type(screen.getByPlaceholderText("Last name"), "Khan");
      await user.type(screen.getByPlaceholderText("Email address"), "ali@gmail.com");
      await user.type(screen.getByPlaceholderText("Password"), "Password123!");
    }

    it("shows the server's error message for a duplicate email", async () => {
      const user = userEvent.setup();
      const err = new Error("Request failed");
      err.response = { data: { message: "Email already registered" } };
      registerUser.mockRejectedValue(err);

      render(<Login />);
      await switchToSignup(user);
      await fillSignupForm(user);
      await user.click(screen.getByRole("button", { name: "Sign Up" }));

      expect(await screen.findByText("Email already registered")).toBeInTheDocument();
    });

    it("shows the server's error message for an invalid email format", async () => {
      const user = userEvent.setup();
      const err = new Error("Request failed");
      err.response = { data: { message: "Invalid email format" } };
      registerUser.mockRejectedValue(err);

      render(<Login />);
      await switchToSignup(user);
      await fillSignupForm(user);
      await user.click(screen.getByRole("button", { name: "Sign Up" }));

      expect(await screen.findByText("Invalid email format")).toBeInTheDocument();
    });

    it("falls back to a generic error message when the server gives none", async () => {
      const user = userEvent.setup();
      registerUser.mockRejectedValue(new Error("Network error"));

      render(<Login />);
      await switchToSignup(user);
      await fillSignupForm(user);
      await user.click(screen.getByRole("button", { name: "Sign Up" }));

      expect(await screen.findByText("Unable to create account")).toBeInTheDocument();
    });

    it("stays on the signup view after a failed registration", async () => {
      const user = userEvent.setup();
      registerUser.mockRejectedValue(new Error("Server down"));

      render(<Login />);
      await switchToSignup(user);
      await fillSignupForm(user);
      await user.click(screen.getByRole("button", { name: "Sign Up" }));

      await screen.findByText("Unable to create account");
      expect(screen.getByPlaceholderText("First name")).toBeInTheDocument();
    });
  });

  // ==========================================================================
  // Mode switching between login and signup
  // ==========================================================================
  describe("switching between login and signup", () => {
    it("switches to the signup form when 'Sign up' is clicked", async () => {
      const user = userEvent.setup();

      render(<Login />);
      await user.click(screen.getByRole("button", { name: "Sign up" }));

      expect(screen.getByPlaceholderText("First name")).toBeInTheDocument();
      expect(screen.getByPlaceholderText("Last name")).toBeInTheDocument();
      expect(screen.getByRole("button", { name: "Sign Up" })).toBeInTheDocument();
    });

    it("switches back to login when 'Login' footer link is clicked", async () => {
      const user = userEvent.setup();

      render(<Login />);
      await user.click(screen.getByRole("button", { name: "Sign up" }));
      await user.click(screen.getByRole("button", { name: "Login" }));

      expect(screen.queryByPlaceholderText("First name")).not.toBeInTheDocument();
      expect(screen.getByRole("button", { name: "Login" })).toBeInTheDocument();
    });

    it("clears fields and messages when switching modes", async () => {
      const user = userEvent.setup();

      render(<Login />);

      await user.type(screen.getByPlaceholderText("Email address"), "ali@gmail.com");
      await user.click(screen.getByRole("button", { name: "Sign up" }));
      await user.click(screen.getByRole("button", { name: "Login" }));

      expect(screen.getByPlaceholderText("Email address")).toHaveValue("");
    });
  });
});