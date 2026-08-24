import "@testing-library/jest-dom";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import EditorToolbar from "../components/notes/EditorToolbar";

// Builds a fake Tiptap editor whose chain().<cmd>().run() calls are trackable,
// and whose can().chain().<cmd>().run() controls disabled state.
function createMockEditor({ isActiveName = null, canUndo = true, canRedo = true } = {}) {
  const chainObj = {
    focus: jest.fn(() => chainObj),
    toggleBold: jest.fn(() => chainObj),
    toggleItalic: jest.fn(() => chainObj),
    toggleStrike: jest.fn(() => chainObj),
    toggleHeading: jest.fn(() => chainObj),
    toggleBulletList: jest.fn(() => chainObj),
    toggleOrderedList: jest.fn(() => chainObj),
    toggleBlockquote: jest.fn(() => chainObj),
    undo: jest.fn(() => chainObj),
    redo: jest.fn(() => chainObj),
    run: jest.fn(),
  };

  return {
    chain: jest.fn(() => chainObj),
    isActive: jest.fn((name) => name === isActiveName),
    can: jest.fn(() => ({
      chain: jest.fn(() => ({
        undo: jest.fn(() => ({ run: jest.fn(() => canUndo) })),
        redo: jest.fn(() => ({ run: jest.fn(() => canRedo) })),
      })),
    })),
    __chain: chainObj,
  };
}

describe("EditorToolbar", () => {
  it("renders nothing when editor is null", () => {
    const { container } = render(<EditorToolbar editor={null} />);
    expect(container).toBeEmptyDOMElement();
  });

  it("renders all formatting buttons when editor is provided", () => {
    render(<EditorToolbar editor={createMockEditor()} />);

    [
      "Bold",
      "Italic",
      "Strikethrough",
      "Heading 1",
      "Heading 2",
      "Bullet list",
      "Ordered list",
      "Blockquote",
      "Undo",
      "Redo",
    ].forEach((label) => {
      expect(screen.getByLabelText(label)).toBeInTheDocument();
    });
  });

  it("calls chain().focus().toggleBold().run() when Bold is clicked", async () => {
    const user = userEvent.setup();
    const editor = createMockEditor();
    render(<EditorToolbar editor={editor} />);

    await user.click(screen.getByLabelText("Bold"));

    expect(editor.__chain.toggleBold).toHaveBeenCalledTimes(1);
    expect(editor.__chain.focus).toHaveBeenCalledTimes(1);
    expect(editor.__chain.run).toHaveBeenCalledTimes(1);
  });

  it("calls toggleItalic when Italic is clicked", async () => {
    const user = userEvent.setup();
    const editor = createMockEditor();
    render(<EditorToolbar editor={editor} />);

    await user.click(screen.getByLabelText("Italic"));

    expect(editor.__chain.toggleItalic).toHaveBeenCalledTimes(1);
  });

  it("calls toggleHeading with level 1 when Heading 1 is clicked", async () => {
    const user = userEvent.setup();
    const editor = createMockEditor();
    render(<EditorToolbar editor={editor} />);

    await user.click(screen.getByLabelText("Heading 1"));

    expect(editor.__chain.toggleHeading).toHaveBeenCalledWith({ level: 1 });
  });

  it("calls toggleBulletList when Bullet list is clicked", async () => {
    const user = userEvent.setup();
    const editor = createMockEditor();
    render(<EditorToolbar editor={editor} />);

    await user.click(screen.getByLabelText("Bullet list"));

    expect(editor.__chain.toggleBulletList).toHaveBeenCalledTimes(1);
  });

  it("calls undo when Undo is clicked", async () => {
    const user = userEvent.setup();
    const editor = createMockEditor({ canUndo: true });
    render(<EditorToolbar editor={editor} />);

    await user.click(screen.getByLabelText("Undo"));

    expect(editor.__chain.undo).toHaveBeenCalledTimes(1);
  });

  it("disables the Undo button when the editor reports it cannot undo", () => {
    const editor = createMockEditor({ canUndo: false });
    render(<EditorToolbar editor={editor} />);

    expect(screen.getByLabelText("Undo")).toBeDisabled();
  });

  it("disables the Redo button when the editor reports it cannot redo", () => {
    const editor = createMockEditor({ canRedo: false });
    render(<EditorToolbar editor={editor} />);

    expect(screen.getByLabelText("Redo")).toBeDisabled();
  });

  it("enables Undo/Redo when the editor reports it can do both", () => {
    const editor = createMockEditor({ canUndo: true, canRedo: true });
    render(<EditorToolbar editor={editor} />);

    expect(screen.getByLabelText("Undo")).not.toBeDisabled();
    expect(screen.getByLabelText("Redo")).not.toBeDisabled();
  });

  it("applies the active style to the Bold button when bold is active", () => {
    const editor = createMockEditor({ isActiveName: "bold" });
    render(<EditorToolbar editor={editor} />);

    expect(screen.getByLabelText("Bold").className).toContain("text-(--color-primary)");
  });

  it("does not apply the active style to Bold when bold is not active", () => {
    const editor = createMockEditor({ isActiveName: "italic" });
    render(<EditorToolbar editor={editor} />);

    expect(screen.getByLabelText("Bold").className).not.toContain("bg-(--color-primary)/10");
  });
});