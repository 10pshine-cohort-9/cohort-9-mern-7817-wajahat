import { useState } from "react";
import Navigation from "../components/layout/Navigation";
import Topbar from "../components/layout/Topbar";
import NotesScreen from "../components/layout/NotesScreen";
import NoteEditor from "../components/notes/NoteEditor";
import AddNoteButton from "../components/notes/AddNoteButton";

const Dashboard = () => {
  const [view, setView] = useState("notes");
  const [activeSection, setActiveSection] = useState("notes");
  const [notesRefreshKey, setNotesRefreshKey] = useState(0);
  const [editingNote, setEditingNote] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const handleAddNote = () => {
    // making sure that editor opens blacnk
    setEditingNote(null);
    setView("editor");
  };
  const handleEditNote = (note) => {
    setEditingNote(note);
    setView("editor");
  };
  const handleCancelEditor = () => {
    setEditingNote(null);
    setView("notes");
  };
  const handleNoteCreated = () => {
    // Refresh notes after creating/updating
    setNotesRefreshKey((previous) => previous + 1);

    setEditingNote(null);
    setView("notes");
    setActiveSection("notes");
  };
  const handleSectionChange = (section) => {
    setActiveSection(section);
    setView("notes");
    setEditingNote(null);
  };

  return (
    <div className="flex h-screen w-full overflow-hidden bg-(--color-background)">
      <Navigation
        activeItem={activeSection}
        onNavigate={handleSectionChange}
      />
      <div className="flex min-w-0 flex-1 flex-col">
        <Topbar
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
        />
        <main className="min-h-0 flex-1 overflow-y-auto p-6 pb-24 md:p-8 md:pb-8">
          {view === "notes" ? (
            <NotesScreen
              key={`${activeSection}-${notesRefreshKey}`}
              section={activeSection}
              searchQuery={searchQuery}
              onEditNote={handleEditNote}
            />
          ) : (
            <NoteEditor
              note={editingNote}
              onCancel={handleCancelEditor}
              onNoteCreated={handleNoteCreated}
            />
          )}
        </main>
        {view === "notes" && (
          <AddNoteButton onClick={handleAddNote} />
        )}
      </div>
    </div>
  );
};
export default Dashboard;