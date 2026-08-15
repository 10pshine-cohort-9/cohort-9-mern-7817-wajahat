import { useEffect, useState } from "react";
import NoteCard from "../notes/NoteCard";
import {
  getAllNotes,
  getStarredNotes,
} from "../../services/notesService";
import Loader from "../common/Loader";

const NotesScreen = ({ section = "notes" }) => {
  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchNotes = async () => {
      // Trash is not implemented yet
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

        if (section === "starred") {
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
  }, [section]);
  // DELETE NOTE
  const handleDelete = (noteId) => {
    setNotes((previousNotes) =>
      previousNotes.filter((note) => note.id !== noteId)
    );
  };
  // STAR / UNSTAR NOTE
  const handleStarChange = (noteId, updatedNote) => {
    // If viewing Starred Notes and the note
    // gets unstarred, remove it immediately.
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
  //assigning titles to pages
  const getTitle = () => {
    if (section === "starred") {
      return "Starred Notes";
    }

    if (section === "trash") {
      return "Trash";
    }
    return "All Notes";
  };
  //trash is not yet implemented
  if (section === "trash") {
    return (
      <section className="w-full px-7">
        <div className="mb-7">
          <h1 className="text-2xl font-bold tracking-[-0.02em] text-(--color-text) md:text-3xl">
            Trash
          </h1>
        </div>

        <div className="py-16 text-center">
          <p className="mt-2 text-xs text-(--color-text-secondary)">
            Deleted notes will appear here in future.
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
            section === "starred"
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
            {section === "starred"
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
            />
          ))}
        </div>
      )}
    </section>
  );
};
export default NotesScreen;