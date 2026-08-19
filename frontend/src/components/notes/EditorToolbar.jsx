import {
  Bold,
  Italic,
  List,
  ListOrdered,
  Quote,
  Redo2,
  Strikethrough,
  Undo2,
} from "lucide-react";

const EditorToolbar = ({ editor }) => {
  if (!editor) {
    return null;
  }

  return (
    <div className="flex flex-wrap items-center gap-1 border-b border-(--color-border) px-3 py-2">
      <button
        type="button"
        onClick={() => editor.chain().focus().toggleBold().run()}
        className={`flex h-8 w-8 items-center justify-center rounded-md transition ${
          editor.isActive("bold")
            ? "bg-(--color-primary)/10 text-(--color-primary)"
            : "text-(--color-text-secondary) hover:bg-(--color-background)"
        }`}
        aria-label="Bold"
        title="Bold"
      >
        <Bold size={17} strokeWidth={2} />
      </button>
      <button
        type="button"
        onClick={() => editor.chain().focus().toggleItalic().run()}
        className={`flex h-8 w-8 items-center justify-center rounded-md transition ${
          editor.isActive("italic")
            ? "bg-(--color-primary)/10 text-(--color-primary)"
            : "text-(--color-text-secondary) hover:bg-(--color-background)"
        }`}
        aria-label="Italic"
        title="Italic"
      >
        <Italic size={17} strokeWidth={2} />
      </button>
      <button
        type="button"
        onClick={() => editor.chain().focus().toggleStrike().run()}
        className={`flex h-8 w-8 items-center justify-center rounded-md transition ${
          editor.isActive("strike")
            ? "bg-(--color-primary)/10 text-(--color-primary)"
            : "text-(--color-text-secondary) hover:bg-(--color-background)"
        }`}
        aria-label="Strikethrough"
        title="Strikethrough"
      >
        <Strikethrough size={17} strokeWidth={2} />
      </button>
      <div className="mx-1 h-5 w-px bg-(--color-border)" />
      <button
        type="button"
        onClick={() =>
          editor.chain().focus().toggleHeading({ level: 1 }).run()
        }
        className={`rounded-md px-2 py-1 text-sm font-semibold transition ${
          editor.isActive("heading", { level: 1 })
            ? "bg-(--color-primary)/10 text-(--color-primary)"
            : "text-(--color-text-secondary) hover:bg-(--color-background)"
        }`}
        aria-label="Heading 1"
        title="Heading 1"
      >
        H1
      </button>
      <button
        type="button"
        onClick={() =>
          editor.chain().focus().toggleHeading({ level: 2 }).run()
        }
        className={`rounded-md px-2 py-1 text-sm font-semibold transition ${
          editor.isActive("heading", { level: 2 })
            ? "bg-(--color-primary)/10 text-(--color-primary)"
            : "text-(--color-text-secondary) hover:bg-(--color-background)"
        }`}
        aria-label="Heading 2"
        title="Heading 2"
      >
        H2
      </button>
      <div className="mx-1 h-5 w-px bg-(--color-border)" />
      <button
        type="button"
        onClick={() => editor.chain().focus().toggleBulletList().run()}
        className={`flex h-8 w-8 items-center justify-center rounded-md transition ${
          editor.isActive("bulletList")
            ? "bg-(--color-primary)/10 text-(--color-primary)"
            : "text-(--color-text-secondary) hover:bg-(--color-background)"
        }`}
        aria-label="Bullet list"
        title="Bullet list"
      >
        <List size={18} strokeWidth={1.8} />
      </button>
      <button
        type="button"
        onClick={() => editor.chain().focus().toggleOrderedList().run()}
        className={`flex h-8 w-8 items-center justify-center rounded-md transition ${
          editor.isActive("orderedList")
            ? "bg-(--color-primary)/10 text-(--color-primary)"
            : "text-(--color-text-secondary) hover:bg-(--color-background)"
        }`}
        aria-label="Ordered list"
        title="Ordered list"
      >
        <ListOrdered size={18} strokeWidth={1.8} />
      </button>
      <button
        type="button"
        onClick={() => editor.chain().focus().toggleBlockquote().run()}
        className={`flex h-8 w-8 items-center justify-center rounded-md transition ${
          editor.isActive("blockquote")
            ? "bg-(--color-primary)/10 text-(--color-primary)"
            : "text-(--color-text-secondary) hover:bg-(--color-background)"
        }`}
        aria-label="Blockquote"
        title="Blockquote"
      >
        <Quote size={18} strokeWidth={1.8} />
      </button>
      <div className="mx-1 h-5 w-px bg-(--color-border)" />
      <button
        type="button"
        onClick={() => editor.chain().focus().undo().run()}
        disabled={!editor.can().chain().undo().run()}
        className="flex h-8 w-8 items-center justify-center rounded-md text-(--color-text-secondary) transition hover:bg-(--color-background) hover:text-(--color-text) disabled:cursor-not-allowed disabled:opacity-30"
        aria-label="Undo"
        title="Undo"
      >
        <Undo2 size={17} strokeWidth={1.8} />
      </button>
      <button
        type="button"
        onClick={() => editor.chain().focus().redo().run()}
        disabled={!editor.can().chain().redo().run()}
        className="flex h-8 w-8 items-center justify-center rounded-md text-(--color-text-secondary) transition hover:bg-(--color-background) hover:text-(--color-text) disabled:cursor-not-allowed disabled:opacity-30"
        aria-label="Redo"
        title="Redo"
      >
        <Redo2 size={17} strokeWidth={1.8} />
      </button>
    </div>
  );
};

export default EditorToolbar;