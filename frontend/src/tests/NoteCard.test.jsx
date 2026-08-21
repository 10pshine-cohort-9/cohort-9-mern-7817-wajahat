import "@testing-library/jest-dom";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import NoteCard from "../components/notes/NoteCard";
import { deleteNote, updateStarStatus } from "../services/notesService";

jest.mock("../services/notesService");

describe("NoteCard", () => {
  const baseProps = {
    id: "note-1",
    title: "My Note",
    content: "<p>Some content</p>",
    updatedAt: new Date().toISOString(),
    isStarred: false,
    onDelete: jest.fn(),
    onStarChange: jest.fn(),
    onClick: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
    jest.spyOn(console, "error").mockImplementation(() => {});
  });

  afterEach(() => {
    console.error.mockRestore();
  });

  it("renders the title and content", () => {
    render(<NoteCard {...baseProps} />);
    expect(screen.getByText("My Note")).toBeInTheDocument();
    expect(screen.getByText("Some content")).toBeInTheDocument();
  });

  it("calls onClick when the card body is clicked", async () => {
    const user = userEvent.setup();
    const onClick = jest.fn();
    render(<NoteCard {...baseProps} onClick={onClick} />);

    await user.click(screen.getByText("My Note"));

    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it("shows an outlined star when not starred and calls updateStarStatus on click", async () => {
    const user = userEvent.setup();
    const onStarChange = jest.fn();
    updateStarStatus.mockResolvedValue({
      data: { data: { id: "note-1", isStarred: true } },
    });

    render(
      <NoteCard {...baseProps} isStarred={false} onStarChange={onStarChange} />
    );

    expect(screen.getByLabelText("Star note")).toBeInTheDocument();

    await user.click(screen.getByLabelText("Star note"));

    expect(updateStarStatus).toHaveBeenCalledWith("note-1", true);
    await waitFor(() =>
      expect(onStarChange).toHaveBeenCalledWith({
        id: "note-1",
        isStarred: true,
      })
    );
  });

  it("does not trigger the card onClick when the star button is clicked", async () => {
    const user = userEvent.setup();
    const onClick = jest.fn();
    updateStarStatus.mockResolvedValue({ data: { data: {} } });

    render(<NoteCard {...baseProps} onClick={onClick} />);

    await user.click(screen.getByLabelText("Star note"));

    expect(onClick).not.toHaveBeenCalled();
  });

  it("calls deleteNote and onDelete when the delete button is clicked", async () => {
    const user = userEvent.setup();
    const onDelete = jest.fn();
    deleteNote.mockResolvedValue({ data: { message: "deleted" } });

    render(<NoteCard {...baseProps} onDelete={onDelete} />);

    await user.click(screen.getByLabelText("Delete note"));

    expect(deleteNote).toHaveBeenCalledWith("note-1");
    await waitFor(() => expect(onDelete).toHaveBeenCalledWith("note-1"));
  });

  it("does not trigger the card onClick when the delete button is clicked", async () => {
    const user = userEvent.setup();
    const onClick = jest.fn();
    deleteNote.mockResolvedValue({ data: {} });

    render(<NoteCard {...baseProps} onClick={onClick} />);

    await user.click(screen.getByLabelText("Delete note"));

    expect(onClick).not.toHaveBeenCalled();
  });

  it("logs an error and does not call onDelete when deletion fails", async () => {
    const user = userEvent.setup();
    const onDelete = jest.fn();
    deleteNote.mockRejectedValue(new Error("Delete failed"));

    render(<NoteCard {...baseProps} onDelete={onDelete} />);

    await user.click(screen.getByLabelText("Delete note"));

    await waitFor(() => expect(console.error).toHaveBeenCalled());
    expect(onDelete).not.toHaveBeenCalled();
  });
});