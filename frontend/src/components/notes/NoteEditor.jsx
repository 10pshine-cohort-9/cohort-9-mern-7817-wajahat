import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import { ArrowLeft, Save } from "lucide-react";
import { useState } from "react";

import EditorToolbar from "./EditorToolbar";
import { createNote } from "../../services/notesService";

const NoteEditor = ({ onCancel, onNoteCreated }) => {
  const [title, setTitle] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const editor = useEditor({
    extensions: [
      StarterKit,
    ],

    content: "",

    editorProps: {
      attributes: {
        class: "tiptap",
      },
    },
  });

  const handleSave = async () => {
    setError("");

    const trimmedTitle = title.trim();

    if (!trimmedTitle) {
      setError("Please enter a title.");
      return;
    }

    if (!editor || editor.isEmpty) {
      setError("Please write something in your note.");
      return;
    }

    try {
      setSaving(true);

      const response = await createNote({
        title: trimmedTitle,
        content: editor.getHTML(),
      });

      const createdNote = response.data?.data;

      if (onNoteCreated) {
        onNoteCreated(createdNote);
      } else {
        onCancel();
      }
    } catch (error) {
      console.error("Failed to create note:", error);

      setError(
        error.response?.data?.message ||
          "Failed to save note. Please try again."
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <section className="mx-auto w-full max-w-5xl px-2 md:px-4">

      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <button
          type="button"
          onClick={onCancel}
          className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-(--color-text-secondary) transition hover:bg-(--color-surface) hover:text-(--color-text)"
        >
          <ArrowLeft size={18} strokeWidth={1.8} />
          Back
        </button>

        <button
          type="button"
          onClick={handleSave}
          disabled={saving}
          className="flex items-center gap-2 rounded-xl bg-(--color-primary) px-5 py-2.5 text-sm font-medium text-white shadow-sm transition hover:bg-(--color-primary-hover) disabled:cursor-not-allowed disabled:opacity-60"
        >
          <Save size={17} strokeWidth={1.8} />

          {saving ? "Saving..." : "Save Note"}
        </button>
      </div>

      {/* Error */}
      {error && (
        <div className="mb-5 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-600">
          {error}
        </div>
      )}

      {/* Editor */}
      <div className="overflow-hidden rounded-2xl border border-(--color-border) bg-(--color-surface) shadow-[0_2px_8px_rgba(0,0,0,0.04)]">

        {/* Title */}
        <div className="border-b border-(--color-border) px-5 py-5">
          <input
            type="text"
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            placeholder="Note title..."
            className="w-full bg-transparent text-2xl font-bold tracking-[-0.02em] text-(--color-text) outline-none placeholder:text-(--color-text-secondary) md:text-3xl"
          />
        </div>

        {/* Toolbar */}
        <EditorToolbar editor={editor} />

        {/* Tiptap */}
        <EditorContent editor={editor} />
      </div>
    </section>
  );
};

export default NoteEditor;