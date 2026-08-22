import "@testing-library/jest-dom";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import NoteEditor from "../components/notes/NoteEditor";
import { createNote, updateNote } from "../services/notesService";
import { useEditor } from "@tiptap/react";

jest.mock("../services/notesService");

jest.mock("@tiptap/react", () => ({
  useEditor: jest.fn(),
  EditorContent: () => <div data-testid="editor-content" />,
}));

jest.mock("@tiptap/starter-kit", () => ({}));

jest.mock("../components/notes/EditorToolbar", () => () => (
  <div data-testid="editor-toolbar" />
));

function createMockEditor(overrides = {}) {
  return {
    isEmpty: false,
    getHTML: jest.fn(() => "<p>Some content</p>"),
    commands: { setContent: jest.fn() },
    ...overrides,
  };
}

describe("NoteEditor", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.spyOn(console, "error").mockImplementation(() => {});
  });

  afterEach(() => {
    console.error.mockRestore();
  });

  describe("create mode", () => {
    it("renders with an empty title and 'Save Note' button", () => {
      useEditor.mockReturnValue(createMockEditor());

      render(<NoteEditor onCancel={jest.fn()} />);

      expect(screen.getByPlaceholderText("Note title...")).toHaveValue("");
      expect(screen.getByRole("button", { name: /save note/i })).toBeInTheDocument();
    });

    it("creates a note successfully and calls onNoteCreated", async () => {
      const user = userEvent.setup();
      useEditor.mockReturnValue(createMockEditor());
      const savedNote = { id: "note-1", title: "My note", content: "<p>Some content</p>" };
      createNote.mockResolvedValue({ data: { data: savedNote } });
      const onNoteCreated = jest.fn();

      render(<NoteEditor onCancel={jest.fn()} onNoteCreated={onNoteCreated} />);

      await user.type(screen.getByPlaceholderText("Note title..."), "My note");
      await user.click(screen.getByRole("button", { name: /save note/i }));

      await waitFor(() =>
        expect(createNote).toHaveBeenCalledWith({
          title: "My note",
          content: "<p>Some content</p>",
        })
      );
      expect(onNoteCreated).toHaveBeenCalledWith(savedNote);
      expect(updateNote).not.toHaveBeenCalled();
    });

    it("calls onCancel instead when onNoteCreated is not provided", async () => {
      const user = userEvent.setup();
      useEditor.mockReturnValue(createMockEditor());
      createNote.mockResolvedValue({ data: { data: { id: "note-1" } } });
      const onCancel = jest.fn();

      render(<NoteEditor onCancel={onCancel} />);

      await user.type(screen.getByPlaceholderText("Note title..."), "My note");
      await user.click(screen.getByRole("button", { name: /save note/i }));

      await waitFor(() => expect(onCancel).toHaveBeenCalledTimes(1));
    });

    it("trims whitespace from the title before saving", async () => {
      const user = userEvent.setup();
      useEditor.mockReturnValue(createMockEditor());
      createNote.mockResolvedValue({ data: { data: { id: "note-1" } } });

      render(<NoteEditor onCancel={jest.fn()} onNoteCreated={jest.fn()} />);

      await user.type(screen.getByPlaceholderText("Note title..."), "  My note  ");
      await user.click(screen.getByRole("button", { name: /save note/i }));

      await waitFor(() =>
        expect(createNote).toHaveBeenCalledWith(
          expect.objectContaining({ title: "My note" })
        )
      );
    });
  });

  describe("edit mode", () => {
    const existingNote = { id: "note-1", title: "Existing note", content: "<p>Old</p>" };

    it("pre-fills the title and shows 'Update Note' button", () => {
      useEditor.mockReturnValue(createMockEditor());

      render(<NoteEditor note={existingNote} onCancel={jest.fn()} />);

      expect(screen.getByPlaceholderText("Note title...")).toHaveValue("Existing note");
      expect(screen.getByRole("button", { name: /update note/i })).toBeInTheDocument();
    });

    it("calls updateNote with the note id on save", async () => {
      const user = userEvent.setup();
      useEditor.mockReturnValue(createMockEditor());
      const updatedNote = { id: "note-1", title: "Existing note", content: "<p>Some content</p>" };
      updateNote.mockResolvedValue({ data: { data: updatedNote } });
      const onNoteCreated = jest.fn();

      render(<NoteEditor note={existingNote} onCancel={jest.fn()} onNoteCreated={onNoteCreated} />);

      await user.click(screen.getByRole("button", { name: /update note/i }));

      await waitFor(() =>
        expect(updateNote).toHaveBeenCalledWith("note-1", {
          title: "Existing note",
          content: "<p>Some content</p>",
        })
      );
      expect(onNoteCreated).toHaveBeenCalledWith(updatedNote);
      expect(createNote).not.toHaveBeenCalled();
    });

    it("syncs title and editor content when the note prop changes", () => {
      const editor = createMockEditor();
      useEditor.mockReturnValue(editor);

      const { rerender } = render(<NoteEditor note={existingNote} onCancel={jest.fn()} />);

      const newNote = { id: "note-2", title: "Different note", content: "<p>New</p>" };
      rerender(<NoteEditor note={newNote} onCancel={jest.fn()} />);

      expect(screen.getByPlaceholderText("Note title...")).toHaveValue("Different note");
      expect(editor.commands.setContent).toHaveBeenCalledWith("<p>New</p>");
    });
  });

  describe("validation", () => {
    it("shows an error and does not save when the title is empty", async () => {
      const user = userEvent.setup();
      useEditor.mockReturnValue(createMockEditor());

      render(<NoteEditor onCancel={jest.fn()} />);

      await user.click(screen.getByRole("button", { name: /save note/i }));

      expect(await screen.findByText("Please enter a title.")).toBeInTheDocument();
      expect(createNote).not.toHaveBeenCalled();
    });

    it("shows an error and does not save when the title is only whitespace", async () => {
      const user = userEvent.setup();
      useEditor.mockReturnValue(createMockEditor());

      render(<NoteEditor onCancel={jest.fn()} />);

      await user.type(screen.getByPlaceholderText("Note title..."), "   ");
      await user.click(screen.getByRole("button", { name: /save note/i }));

      expect(await screen.findByText("Please enter a title.")).toBeInTheDocument();
      expect(createNote).not.toHaveBeenCalled();
    });

    it("shows an error and does not save when the editor content is empty", async () => {
      const user = userEvent.setup();
      useEditor.mockReturnValue(createMockEditor({ isEmpty: true }));

      render(<NoteEditor onCancel={jest.fn()} />);

      await user.type(screen.getByPlaceholderText("Note title..."), "My note");
      await user.click(screen.getByRole("button", { name: /save note/i }));

      expect(
        await screen.findByText("Please write something in your note.")
      ).toBeInTheDocument();
      expect(createNote).not.toHaveBeenCalled();
    });

    it("shows an error if the editor instance is not ready yet", async () => {
      const user = userEvent.setup();
      useEditor.mockReturnValue(null);

      render(<NoteEditor onCancel={jest.fn()} />);

      await user.type(screen.getByPlaceholderText("Note title..."), "My note");
      await user.click(screen.getByRole("button", { name: /save note/i }));

      expect(
        await screen.findByText("Please write something in your note.")
      ).toBeInTheDocument();
    });
  });

  describe("error handling", () => {
    it("shows the server's error message when create fails", async () => {
      const user = userEvent.setup();
      useEditor.mockReturnValue(createMockEditor());
      const err = new Error("Request failed");
      err.response = { data: { message: "Title already exists" } };
      createNote.mockRejectedValue(err);

      render(<NoteEditor onCancel={jest.fn()} />);

      await user.type(screen.getByPlaceholderText("Note title..."), "My note");
      await user.click(screen.getByRole("button", { name: /save note/i }));

      expect(await screen.findByText("Title already exists")).toBeInTheDocument();
    });

    it("falls back to a generic create-error message when the server gives none", async () => {
      const user = userEvent.setup();
      useEditor.mockReturnValue(createMockEditor());
      createNote.mockRejectedValue(new Error("Network error"));

      render(<NoteEditor onCancel={jest.fn()} />);

      await user.type(screen.getByPlaceholderText("Note title..."), "My note");
      await user.click(screen.getByRole("button", { name: /save note/i }));

      expect(
        await screen.findByText("Failed to save note. Please try again.")
      ).toBeInTheDocument();
    });

    it("falls back to a generic update-error message when editing and the server gives none", async () => {
      const user = userEvent.setup();
      useEditor.mockReturnValue(createMockEditor());
      updateNote.mockRejectedValue(new Error("Network error"));

      render(
        <NoteEditor
          note={{ id: "note-1", title: "Existing", content: "<p>Old</p>" }}
          onCancel={jest.fn()}
        />
      );

      await user.click(screen.getByRole("button", { name: /update note/i }));

      expect(
        await screen.findByText("Failed to update note. Please try again.")
      ).toBeInTheDocument();
    });

    it("re-enables the save button after a failed save", async () => {
      const user = userEvent.setup();
      useEditor.mockReturnValue(createMockEditor());
      createNote.mockRejectedValue(new Error("Network error"));

      render(<NoteEditor onCancel={jest.fn()} />);

      await user.type(screen.getByPlaceholderText("Note title..."), "My note");
      await user.click(screen.getByRole("button", { name: /save note/i }));

      await screen.findByText("Failed to save note. Please try again.");
      expect(screen.getByRole("button", { name: /save note/i })).not.toBeDisabled();
    });

    it("logs the error to the console", async () => {
      const user = userEvent.setup();
      useEditor.mockReturnValue(createMockEditor());
      createNote.mockRejectedValue(new Error("Network error"));

      render(<NoteEditor onCancel={jest.fn()} />);

      await user.type(screen.getByPlaceholderText("Note title..."), "My note");
      await user.click(screen.getByRole("button", { name: /save note/i }));

      await waitFor(() => expect(console.error).toHaveBeenCalled());
    });
  });

  describe("cancel", () => {
    it("calls onCancel when the Cancel button is clicked", async () => {
      const user = userEvent.setup();
      useEditor.mockReturnValue(createMockEditor());
      const onCancel = jest.fn();

      render(<NoteEditor onCancel={onCancel} />);

      await user.click(screen.getByRole("button", { name: /cancel/i }));

      expect(onCancel).toHaveBeenCalledTimes(1);
    });
  });
});