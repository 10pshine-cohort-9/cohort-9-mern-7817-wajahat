import { useEffect, useState } from "react";
import NoteCard from "../notes/NoteCard";
import {
  getAllNotes,
  getStarredNotes,
  searchNotes,
} from "../../services/notesService";
import Loader from "../common/Loader";
const NotesScreen = ({
  section = "notes",
  searchQuery = "",
  onEditNote,
}) => {
  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  useEffect(() => {
    const fetchNotes = async () => {
      // Trash is not yet implemented due to api missing for that for now
      if (section === "trash") {
        setNotes([]);
        setLoading(false);
        setError("");
        return;
      }
      try {
        setLoading(true);
        setError("");

        let response;
        const query = searchQuery.trim();

        if (query) {
          response = await searchNotes(query);
        } else if (section === "starred") {
          response = await getStarredNotes();
        } else {
          response = await getAllNotes();
        }

        setNotes(response.data?.data || []);
      } catch (error) {
        console.error("Failed to fetch notes:", error);
        setError("Failed to load notes.");
      } finally {
        setLoading(false);
      }
    };

    fetchNotes();
  }, [section, searchQuery]);
  const handleDelete = (noteId) => {
    setNotes((previousNotes) =>
      previousNotes.filter((note) => note.id !== noteId)
    );
  };
  const handleStarChange = (noteId, updatedNote) => {
    if (section === "starred" && !updatedNote.isStarred) {
      setNotes((previousNotes) =>
        previousNotes.filter((note) => note.id !== noteId)
      );
      return;
    }
    setNotes((previousNotes) =>
      previousNotes.map((note) =>
        note.id === noteId
          ? {
              ...note,
              isStarred: updatedNote.isStarred,
            }
          : note
      )
    );
  };
  const getTitle = () => {
    if (searchQuery.trim()) {
      return "Search Results";
    }
    if (section === "starred") {
      return "Starred Notes";
    }
    if (section === "trash") {
      return "Trash";
    }
    return "All Notes";
  };
  if (section === "trash") {
    return (
      <section className="w-full px-7">
        <div className="mb-7">
          <h1 className="text-2xl font-bold tracking-[-0.02em] text-(--color-text) md:text-3xl">
            Trash
          </h1>
        </div>

        <div className="py-16 text-center">
          <p className="text-sm font-medium text-(--color-text-secondary)">
            Trash is coming soon.
          </p>

          <p className="mt-2 text-xs text-(--color-text-secondary)">
            Deleted notes will appear here in a future update.
          </p>
        </div>
      </section>
    );
  }
  if (loading) {
    return (
      <section className="w-full px-7">
        <Loader
          message={
            searchQuery.trim()
              ? "Searching your notes..."
              : section === "starred"
                ? "Finding your starred notes..."
                : "Opening your notes..."
          }
        />
      </section>
    );
  }
  if (error) {
    return (
      <section className="w-full px-7">
        <h1 className="text-2xl font-bold text-(--color-text) md:text-3xl">
          {getTitle()}
        </h1>

        <p className="mt-2 text-sm text-red-500">
          {error}
        </p>
      </section>
    );
  }
  return (
    <section className="w-full px-7">
      <div className="mb-7">
        <h1 className="text-2xl font-bold tracking-[-0.02em] text-(--color-text) md:text-3xl">
          {getTitle()}
        </h1>

        <p className="mt-1.5 text-sm font-medium text-(--color-text-secondary)">
          {notes.length} {notes.length === 1 ? "note" : "notes"}
        </p>
      </div>
      {notes.length === 0 ? (
        <div className="py-16 text-center">
          <p className="text-sm text-(--color-text-secondary)">
            {searchQuery.trim()
              ? "No notes found."
              : section === "starred"
                ? "You don't have any starred notes yet."
                : "You don't have any notes yet."}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
          {notes.map((note) => (
            <NoteCard
              key={note.id}
              id={note.id}
              title={note.title}
              content={note.content}
              updatedAt={note.updatedAt}
              isStarred={note.isStarred}
              onDelete={handleDelete}
              onStarChange={(updatedNote) =>
                handleStarChange(note.id, updatedNote)
              }
              onClick={() => onEditNote?.(note)}
            />
          ))}
        </div>
      )}
    </section>
  );
};

export default NotesScreen;