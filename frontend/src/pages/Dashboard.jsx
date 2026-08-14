import Navigation from "../components/layout/Navigation";
import Topbar from "../components/layout/Topbar";

const Dashboard = () => {
  return (
    <div className="flex min-h-screen w-full bg-(--color-background)">
      {/* Sidebar */}
      <Navigation />

      {/* Everything after sidebar */}
      <div className="flex min-w-0 flex-1 flex-col">
        <Topbar />

        <main className="flex-1 p-6 pb-24 md:pb-6">
          <h1 className="text-2xl font-semibold text-(--color-text)">
            All Notes
          </h1>
        </main>
      </div>
    </div>
  );
};

export default Dashboard;