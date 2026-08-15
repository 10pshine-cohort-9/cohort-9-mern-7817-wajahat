// import Navigation from "../components/layout/Navigation";
// import NotesScreen from "../components/layout/NotesScreen";
// import Topbar from "../components/layout/Topbar";
// import AddNoteButton from "../components/notes/AddNoteButton";

// const Dashboard = () => {
//   const handleAddNote=()=>{
//     console.log("Add note clicked")
//   }
//   return (
//     <div className="flex min-h-screen w-full bg-(--color-background)">
//       <Navigation />

//       <div className="flex min-w-0 flex-1 flex-col">
//         <Topbar />

//         {/* Scrollable notes area */}
//         <main className="min-h-0 flex-1 overflow-y-auto p-6 pb-24 md:p-8 md:pb-8">
//           <NotesScreen />
//         </main>
//         <AddNoteButton onClick={handleAddNote} />
//       </div>
//     </div>
//   );
// };

// export default Dashboard;

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

  const handleAddNote = () => {
    setView("editor");
  };

  const handleCancelEditor = () => {
    setView("notes");
  };

  const handleNoteCreated = () => {
    setNotesRefreshKey((previous) => previous + 1);
    setView("notes");
    setActiveSection("notes");
  };

  const handleSectionChange = (section) => {
    setActiveSection(section);
    setView("notes");
  };

  return (
    <div className="flex h-screen w-full overflow-hidden bg-(--color-background)">
      <Navigation
        activeItem={activeSection}
        onNavigate={handleSectionChange}
      />

      <div className="flex min-w-0 flex-1 flex-col">
        <Topbar />

        <main className="min-h-0 flex-1 overflow-y-auto p-6 pb-24 md:p-8 md:pb-8">
          {view === "notes" ? (
            <NotesScreen
              key={`${activeSection}-${notesRefreshKey}`}
              section={activeSection}
            />
          ) : (
            <NoteEditor
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