import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import { ArrowLeft, Save } from "lucide-react";
import { useEffect, useState } from "react";

import EditorToolbar from "./EditorToolbar";
import {
  createNote,
  updateNote,
} from "../../services/notesService";
const NoteEditor = ({ note = null, onCancel, onNoteCreated }) => {
  const [title, setTitle] = useState(note?.title || "");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const isEditing = Boolean(note);

  const editor = useEditor({
    extensions: [StarterKit],

    content: note?.content || "",

    editorProps: {
      attributes: {
        class: "tiptap",
      },
    },
  });
  useEffect(() => {
    if (!note || !editor) return;

    setTitle(note.title || "");

    editor.commands.setContent(note.content || "");
  }, [note, editor]);
//saving note in case of updation
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

      const noteData = {
        title: trimmedTitle,
        content: editor.getHTML(),
      };
      //here we handle the logic or calling or updating note
      let response;
      if (isEditing) {
        response = await updateNote(note.id, noteData);
      } else {
        response = await createNote(noteData);
      }
      const savedNote = response.data?.data;
      if (onNoteCreated) {
        onNoteCreated(savedNote);
      } else {
        onCancel();
      }
    } catch (error) {
      console.error(
        isEditing
          ? "Failed to update note:"
          : "Failed to create note:",
        error
      );
      setError(
        error.response?.data?.message ||
          (isEditing
            ? "Failed to update note. Please try again."
            : "Failed to save note. Please try again.")
      );
    } finally {
      setSaving(false);
    }
  };
  let saveButtonLabel = "Save Note";
  if (saving) {
    saveButtonLabel = isEditing ? "Updating..." : "Saving...";
  } else if (isEditing) {
    saveButtonLabel = "Update Note";
  }
  return (
    <section className="mx-auto w-full max-w-5xl px-2 md:px-4">
      <div className="mb-6 flex items-center justify-between">
        <button
          type="button"
          onClick={onCancel}
          disabled={saving}
          className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-(--color-text-secondary) transition hover:bg-(--color-surface) hover:text-(--color-text) disabled:cursor-not-allowed disabled:opacity-50">
          <ArrowLeft size={18} strokeWidth={1.8} />
          Cancel
        </button>
        <button
          type="button"
          onClick={handleSave}
          disabled={saving}
          className="flex items-center gap-2 rounded-xl bg-(--color-primary) px-5 py-2.5 text-sm font-medium text-white shadow-sm transition hover:bg-(--color-primary-hover) disabled:cursor-not-allowed disabled:opacity-60">
          <Save size={17} strokeWidth={1.8} />
            {saveButtonLabel}
        </button>
      </div>
      {error && (
        <div className="mb-5 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-600">
          {error}
        </div>
      )}
      <div className="overflow-hidden rounded-2xl border border-(--color-border) bg-(--color-surface) shadow-[0_2px_8px_rgba(0,0,0,0.04)]">
        <div className="border-b border-(--color-border) px-5 py-5">
          <input
            type="text"
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            placeholder="Note title..."
            className="w-full bg-transparent text-2xl font-bold tracking-[-0.02em] text-(--color-text) outline-none placeholder:text-(--color-text-secondary) md:text-3xl"
          />
        </div>
        <EditorToolbar editor={editor} />
        <EditorContent editor={editor} />
      </div>
    </section>
  );
};
export default NoteEditor;