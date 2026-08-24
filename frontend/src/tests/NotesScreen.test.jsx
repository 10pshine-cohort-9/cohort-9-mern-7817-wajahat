import "@testing-library/jest-dom";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import NotesScreen from "../components/layout/NotesScreen";
import {
  getAllNotes,
  getStarredNotes,
  searchNotes,
} from "../services/notesService";

jest.mock("../services/notesService");

jest.mock("../components/notes/NoteCard", () => (props) => (
  <div data-testid={`note-card-${props.id}`}>
    <span>{props.title}</span>
    <button onClick={() => props.onClick()}>Open {props.title}</button>
    <button onClick={() => props.onDelete(props.id)}>Delete {props.title}</button>
    <button
      onClick={() =>
        props.onStarChange({ id: props.id, isStarred: !props.isStarred })
      }
    >
      Toggle star {props.title}
    </button>
  </div>
));

const sampleNotes = [
  { id: "note-1", title: "First note", content: "Body 1", isStarred: false, updatedAt: "2026-01-01" },
  { id: "note-2", title: "Second note", content: "Body 2", isStarred: true, updatedAt: "2026-01-02" },
];

describe("NotesScreen", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.spyOn(console, "error").mockImplementation(() => {});
  });

  afterEach(() => {
    console.error.mockRestore();
  });

  it("shows a loading message while notes are being fetched", async () => {
    let resolveFetch;
    getAllNotes.mockReturnValue(new Promise((resolve) => (resolveFetch = resolve)));

    render(<NotesScreen section="notes" searchQuery="" />);

    expect(screen.getByText("Opening your notes...")).toBeInTheDocument();

    resolveFetch({ data: { data: [] } });
    await waitFor(() => expect(screen.queryByText("Opening your notes...")).not.toBeInTheDocument());
  });

  it('shows a starred-specific loading message for the "starred" section', () => {
    getStarredNotes.mockReturnValue(new Promise(() => {}));

    render(<NotesScreen section="starred" searchQuery="" />);

    expect(screen.getByText("Finding your starred notes...")).toBeInTheDocument();
  });

  it("shows a search-specific loading message when a query is present", () => {
    searchNotes.mockReturnValue(new Promise(() => {}));

    render(<NotesScreen section="notes" searchQuery="todo" />);

    expect(screen.getByText("Searching your notes...")).toBeInTheDocument();
  });

  describe("notes section", () => {
    it("fetches and renders all notes", async () => {
      getAllNotes.mockResolvedValue({ data: { data: sampleNotes } });

      render(<NotesScreen section="notes" searchQuery="" />);

      expect(await screen.findByText("First note")).toBeInTheDocument();
      expect(screen.getByText("Second note")).toBeInTheDocument();
      expect(getAllNotes).toHaveBeenCalledTimes(1);
      expect(getStarredNotes).not.toHaveBeenCalled();
      expect(searchNotes).not.toHaveBeenCalled();
    });

    it('shows "All Notes" as the title', async () => {
      getAllNotes.mockResolvedValue({ data: { data: sampleNotes } });

      render(<NotesScreen section="notes" searchQuery="" />);

      expect(await screen.findByText("All Notes")).toBeInTheDocument();
    });

    it("shows the note count", async () => {
      getAllNotes.mockResolvedValue({ data: { data: sampleNotes } });

      render(<NotesScreen section="notes" searchQuery="" />);

      expect(await screen.findByText("2 notes")).toBeInTheDocument();
    });

    it("uses singular 'note' for exactly one note", async () => {
      getAllNotes.mockResolvedValue({ data: { data: [sampleNotes[0]] } });

      render(<NotesScreen section="notes" searchQuery="" />);

      expect(await screen.findByText("1 note")).toBeInTheDocument();
    });

    it("shows an empty state when there are no notes", async () => {
      getAllNotes.mockResolvedValue({ data: { data: [] } });

      render(<NotesScreen section="notes" searchQuery="" />);

      expect(await screen.findByText("You don't have any notes yet.")).toBeInTheDocument();
    });

    it("falls back to an empty list if response.data.data is missing", async () => {
      getAllNotes.mockResolvedValue({ data: {} });

      render(<NotesScreen section="notes" searchQuery="" />);

      expect(await screen.findByText("You don't have any notes yet.")).toBeInTheDocument();
    });
  });

  describe("starred section", () => {
    it("fetches starred notes instead of all notes", async () => {
      getStarredNotes.mockResolvedValue({ data: { data: [sampleNotes[1]] } });

      render(<NotesScreen section="starred" searchQuery="" />);

      expect(await screen.findByText("Second note")).toBeInTheDocument();
      expect(getStarredNotes).toHaveBeenCalledTimes(1);
      expect(getAllNotes).not.toHaveBeenCalled();
    });

    it('shows "Starred Notes" as the title', async () => {
      getStarredNotes.mockResolvedValue({ data: { data: [] } });

      render(<NotesScreen section="starred" searchQuery="" />);

      expect(await screen.findByText("Starred Notes")).toBeInTheDocument();
    });

    it("shows a starred-specific empty state", async () => {
      getStarredNotes.mockResolvedValue({ data: { data: [] } });

      render(<NotesScreen section="starred" searchQuery="" />);

      expect(
        await screen.findByText("You don't have any starred notes yet.")
      ).toBeInTheDocument();
    });
  });

  describe("search", () => {
    it("calls searchNotes with the trimmed query when a query is present", async () => {
      searchNotes.mockResolvedValue({ data: { data: [sampleNotes[0]] } });

      render(<NotesScreen section="notes" searchQuery="  first  " />);

      await screen.findByText("First note");
      expect(searchNotes).toHaveBeenCalledWith("first");
      expect(getAllNotes).not.toHaveBeenCalled();
    });

    it('shows "Search Results" as the title when searching', async () => {
      searchNotes.mockResolvedValue({ data: { data: [] } });

      render(<NotesScreen section="notes" searchQuery="xyz" />);

      expect(await screen.findByText("Search Results")).toBeInTheDocument();
    });

    it("shows a search-specific empty state when nothing matches", async () => {
      searchNotes.mockResolvedValue({ data: { data: [] } });

      render(<NotesScreen section="notes" searchQuery="nonexistent" />);

      expect(await screen.findByText("No notes found.")).toBeInTheDocument();
    });

    it("search takes priority over the starred section", async () => {
      searchNotes.mockResolvedValue({ data: { data: [] } });

      render(<NotesScreen section="starred" searchQuery="todo" />);

      await waitFor(() => expect(searchNotes).toHaveBeenCalledWith("todo"));
      expect(getStarredNotes).not.toHaveBeenCalled();
    });
  });

  describe("trash section", () => {
    it('shows the "coming soon" trash placeholder without calling any API', async () => {
      render(<NotesScreen section="trash" searchQuery="" />);

      expect(await screen.findByText("Trash is coming soon.")).toBeInTheDocument();
      expect(getAllNotes).not.toHaveBeenCalled();
      expect(getStarredNotes).not.toHaveBeenCalled();
      expect(searchNotes).not.toHaveBeenCalled();
    });
  });

  describe("error handling", () => {
    it("shows an error message when the fetch fails", async () => {
      getAllNotes.mockRejectedValue(new Error("Network error"));

      render(<NotesScreen section="notes" searchQuery="" />);

      expect(await screen.findByText("Failed to load notes.")).toBeInTheDocument();
      expect(console.error).toHaveBeenCalled();
    });

    it("still shows the correct title alongside the error", async () => {
      getStarredNotes.mockRejectedValue(new Error("Network error"));

      render(<NotesScreen section="starred" searchQuery="" />);

      expect(await screen.findByText("Starred Notes")).toBeInTheDocument();
      expect(screen.getByText("Failed to load notes.")).toBeInTheDocument();
    });
  });

  describe("interactions", () => {
    it("removes a note from the list when deleted", async () => {
      const user = userEvent.setup();
      getAllNotes.mockResolvedValue({ data: { data: sampleNotes } });

      render(<NotesScreen section="notes" searchQuery="" />);
      await screen.findByText("First note");

      await user.click(screen.getByText("Delete First note"));

      expect(screen.queryByText("First note")).not.toBeInTheDocument();
      expect(screen.getByText("Second note")).toBeInTheDocument();
    });

    it("updates a note's starred state in place in the 'notes' section", async () => {
      const user = userEvent.setup();
      getAllNotes.mockResolvedValue({ data: { data: [sampleNotes[0]] } });

      render(<NotesScreen section="notes" searchQuery="" />);
      await screen.findByText("First note");

      await user.click(screen.getByText("Toggle star First note"));

      expect(screen.getByText("First note")).toBeInTheDocument();
    });

    it("removes a note from the 'starred' section when it gets unstarred", async () => {
      const user = userEvent.setup();
      getStarredNotes.mockResolvedValue({ data: { data: [sampleNotes[1]] } });

      render(<NotesScreen section="starred" searchQuery="" />);
      await screen.findByText("Second note");

      await user.click(screen.getByText("Toggle star Second note"));

      expect(screen.queryByText("Second note")).not.toBeInTheDocument();
    });

    it("calls onEditNote with the note when a note card is clicked", async () => {
      const user = userEvent.setup();
      const onEditNote = jest.fn();
      getAllNotes.mockResolvedValue({ data: { data: [sampleNotes[0]] } });

      render(<NotesScreen section="notes" searchQuery="" onEditNote={onEditNote} />);
      await screen.findByText("First note");

      await user.click(screen.getByText("Open First note"));

      expect(onEditNote).toHaveBeenCalledWith(sampleNotes[0]);
    });

    it("does not throw when a note card is clicked and onEditNote is not provided", async () => {
      const user = userEvent.setup();
      getAllNotes.mockResolvedValue({ data: { data: [sampleNotes[0]] } });

      render(<NotesScreen section="notes" searchQuery="" />);
      await screen.findByText("First note");

      await expect(user.click(screen.getByText("Open First note"))).resolves.not.toThrow();
    });
  });

  describe("re-fetching on changes", () => {
    it("re-fetches when the section changes", async () => {
      getAllNotes.mockResolvedValue({ data: { data: [] } });
      getStarredNotes.mockResolvedValue({ data: { data: [] } });

      const { rerender } = render(<NotesScreen section="notes" searchQuery="" />);
      await waitFor(() => expect(getAllNotes).toHaveBeenCalledTimes(1));

      rerender(<NotesScreen section="starred" searchQuery="" />);
      await waitFor(() => expect(getStarredNotes).toHaveBeenCalledTimes(1));
    });

    it("re-fetches when the search query changes", async () => {
      getAllNotes.mockResolvedValue({ data: { data: [] } });
      searchNotes.mockResolvedValue({ data: { data: [] } });

      const { rerender } = render(<NotesScreen section="notes" searchQuery="" />);
      await waitFor(() => expect(getAllNotes).toHaveBeenCalledTimes(1));

      rerender(<NotesScreen section="notes" searchQuery="todo" />);
      await waitFor(() => expect(searchNotes).toHaveBeenCalledWith("todo"));
    });
  });
});