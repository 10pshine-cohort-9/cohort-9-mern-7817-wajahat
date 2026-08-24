import "@testing-library/jest-dom";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import Topbar from "../components/layout/Topbar";
import { useTheme } from "../theme/ThemeContext";
import { useAuth } from "../context/AuthContext";

jest.mock("../theme/ThemeContext");
jest.mock("../context/AuthContext");

describe("Topbar", () => {
  const baseProps = {
    onMenuClick: jest.fn(),
    searchQuery: "",
    onSearchChange: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
    useAuth.mockReturnValue({ user: { firstName: "Ali", lastName: "Khan" } });
  });

  it("renders the search inputs with the current query", () => {
    useTheme.mockReturnValue({ theme: "light", toggleTheme: jest.fn() });

    render(<Topbar {...baseProps} searchQuery="todo" />);

    const searchInputs = screen.getAllByPlaceholderText("Search notes...");
    searchInputs.forEach((input) => expect(input).toHaveValue("todo"));
  });

  it("calls onSearchChange when typing in the search input", async () => {
    const user = userEvent.setup();
    useTheme.mockReturnValue({ theme: "light", toggleTheme: jest.fn() });
    const onSearchChange = jest.fn();

    render(<Topbar {...baseProps} onSearchChange={onSearchChange} />);

    const searchInputs = screen.getAllByPlaceholderText("Search notes...");
    await user.type(searchInputs[0], "a");

    expect(onSearchChange).toHaveBeenCalledWith("a");
  });

  it('shows the Moon icon button when theme is "light"', () => {
    useTheme.mockReturnValue({ theme: "light", toggleTheme: jest.fn() });

    render(<Topbar {...baseProps} />);

    expect(screen.getAllByLabelText("Toggle theme").length).toBeGreaterThan(0);
  });

  it("calls toggleTheme when the theme button is clicked", async () => {
    const user = userEvent.setup();
    const toggleTheme = jest.fn();
    useTheme.mockReturnValue({ theme: "light", toggleTheme });

    render(<Topbar {...baseProps} />);

    const toggleButtons = screen.getAllByLabelText("Toggle theme");
    await user.click(toggleButtons[0]);

    expect(toggleTheme).toHaveBeenCalledTimes(1);
  });

  it("shows the user's initial from firstName", () => {
    useTheme.mockReturnValue({ theme: "light", toggleTheme: jest.fn() });
    useAuth.mockReturnValue({ user: { firstName: "Ali", lastName: "Khan" } });

    render(<Topbar {...baseProps} />);

    expect(screen.getByText("A")).toBeInTheDocument();
  });

  it('shows "?" when there is no user', () => {
    useTheme.mockReturnValue({ theme: "light", toggleTheme: jest.fn() });
    useAuth.mockReturnValue({ user: null });

    render(<Topbar {...baseProps} />);

    expect(screen.getByText("?")).toBeInTheDocument();
  });

  it("calls onMenuClick when the mobile menu button is clicked", async () => {
    const user = userEvent.setup();
    useTheme.mockReturnValue({ theme: "light", toggleTheme: jest.fn() });
    const onMenuClick = jest.fn();

    render(<Topbar {...baseProps} onMenuClick={onMenuClick} />);

    await user.click(screen.getByLabelText("Open profile"));

    expect(onMenuClick).toHaveBeenCalledTimes(1);
  });
});