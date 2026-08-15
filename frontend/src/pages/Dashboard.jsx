import Navigation from "../components/layout/Navigation";
import NotesScreen from "../components/layout/NotesScreen";
import Topbar from "../components/layout/Topbar";
import AddNoteButton from "../components/notes/AddNoteButton";

const Dashboard = () => {
  const handleAddNote=()=>{
    console.log("Add note clicked")
  }
  return (
    <div className="flex min-h-screen w-full bg-(--color-background)">
      <Navigation />

      <div className="flex min-w-0 flex-1 flex-col">
        <Topbar />

        {/* Scrollable notes area */}
        <main className="min-h-0 flex-1 overflow-y-auto p-6 pb-24 md:p-8 md:pb-8">
          <NotesScreen />
        </main>
        <AddNoteButton onClick={handleAddNote} />
      </div>
    </div>
  );
};

export default Dashboard;