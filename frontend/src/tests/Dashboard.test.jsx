import "@testing-library/jest-dom";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import Dashboard from "../pages/Dashboard";

// Mock every child component so this test only exercises Dashboard's own
// state/view logic, not the internals of Navigation/NotesScreen/NoteEditor.
jest.mock("../components/layout/Navigation", () => (props) => (
  <div data-testid="navigation">
    <span data-testid="active-item">{props.activeItem}</span>
    <button onClick={() => props.onNavigate("starred")}>Go to starred</button>
  </div>
));

jest.mock("../components/layout/Topbar", () => (props) => (
  <div data-testid="topbar">
    <input
      data-testid="search-input"
      value={props.searchQuery}
      onChange={(e) => props.onSearchChange(e.target.value)}
    />
    <button onClick={props.onMenuClick}>Menu</button>
  </div>
));

jest.mock("../components/layout/NotesScreen", () => (props) => (
  <div data-testid="notes-screen">
    <span data-testid="notes-section">{props.section}</span>
    <span data-testid="notes-search">{props.searchQuery}</span>
    <button onClick={() => props.onEditNote({ id: "note-1", title: "Existing" })}>
      Edit note
    </button>
  </div>
));

jest.mock("../components/notes/NoteEditor", () => (props) => (
  <div data-testid="note-editor">
    <span data-testid="editing-note-title">{props.note ? props.note.title : "blank"}</span>
    <button onClick={props.onCancel}>Cancel editor</button>
    <button onClick={props.onNoteCreated}>Save note</button>
  </div>
));

jest.mock("../components/notes/AddNoteButton", () => (props) => (
  <button onClick={props.onClick}>Add new note</button>
));

describe("Dashboard", () => {
  it("renders the notes screen by default", () => {
    render(<Dashboard />);

    expect(screen.getByTestId("notes-screen")).toBeInTheDocument();
    expect(screen.queryByTestId("note-editor")).not.toBeInTheDocument();
    expect(screen.getByTestId("notes-section")).toHaveTextContent("notes");
  });

  it("shows the AddNoteButton in notes view", () => {
    render(<Dashboard />);
    expect(screen.getByText("Add new note")).toBeInTheDocument();
  });

  it("switches to the editor with a blank note when AddNoteButton is clicked", async () => {
    const user = userEvent.setup();
    render(<Dashboard />);

    await user.click(screen.getByText("Add new note"));

    expect(screen.getByTestId("note-editor")).toBeInTheDocument();
    expect(screen.getByTestId("editing-note-title")).toHaveTextContent("blank");
    expect(screen.queryByTestId("notes-screen")).not.toBeInTheDocument();
  });

  it("hides the AddNoteButton while in editor view", async () => {
    const user = userEvent.setup();
    render(<Dashboard />);

    await user.click(screen.getByText("Add new note"));

    expect(screen.queryByText("Add new note")).not.toBeInTheDocument();
  });

  it("switches to the editor with the selected note when editing", async () => {
    const user = userEvent.setup();
    render(<Dashboard />);

    await user.click(screen.getByText("Edit note"));

    expect(screen.getByTestId("note-editor")).toBeInTheDocument();
    expect(screen.getByTestId("editing-note-title")).toHaveTextContent("Existing");
  });

  it("returns to notes view when the editor is cancelled", async () => {
    const user = userEvent.setup();
    render(<Dashboard />);

    await user.click(screen.getByText("Add new note"));
    expect(screen.getByTestId("note-editor")).toBeInTheDocument();

    await user.click(screen.getByText("Cancel editor"));

    expect(screen.getByTestId("notes-screen")).toBeInTheDocument();
    expect(screen.queryByTestId("note-editor")).not.toBeInTheDocument();
  });

  it("returns to the notes section after a note is created/saved", async () => {
    const user = userEvent.setup();
    render(<Dashboard />);

    await user.click(screen.getByText("Go to starred"));
    await user.click(screen.getByText("Add new note"));
    await user.click(screen.getByText("Save note"));

    expect(screen.getByTestId("notes-screen")).toBeInTheDocument();
    expect(screen.getByTestId("notes-section")).toHaveTextContent("notes");
    expect(screen.getByTestId("active-item")).toHaveTextContent("notes");
  });

  it("changes the active section via Navigation and resets to notes view", async () => {
    const user = userEvent.setup();
    render(<Dashboard />);

    await user.click(screen.getByText("Go to starred"));

    expect(screen.getByTestId("active-item")).toHaveTextContent("starred");
    expect(screen.getByTestId("notes-section")).toHaveTextContent("starred");
  });

  it("discards an in-progress edit when the section changes", async () => {
    const user = userEvent.setup();
    render(<Dashboard />);

    await user.click(screen.getByText("Edit note"));
    expect(screen.getByTestId("note-editor")).toBeInTheDocument();

    await user.click(screen.getByText("Go to starred"));

    expect(screen.getByTestId("notes-screen")).toBeInTheDocument();
    expect(screen.getByTestId("notes-section")).toHaveTextContent("starred");
  });

  it("passes the search query from Topbar down to NotesScreen", async () => {
    const user = userEvent.setup();
    render(<Dashboard />);

    await user.type(screen.getByTestId("search-input"), "todo");

    expect(screen.getByTestId("notes-search")).toHaveTextContent("todo");
  });

  it("calls onMenuClick from the topbar without throwing", async () => {
    const user = userEvent.setup();
    render(<Dashboard />);

    await expect(user.click(screen.getByText("Menu"))).resolves.not.toThrow();
  });
});