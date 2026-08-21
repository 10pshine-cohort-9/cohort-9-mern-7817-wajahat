import { ArrowLeft, LogOut } from "lucide-react";
import { useNavigate } from "react-router-dom";

import { useAuth } from "../context/AuthContext";

const Profile = ({ onClose }) => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const fullName =
    `${user?.firstName || ""} ${user?.lastName || ""}`.trim() || "User";

  const userInitial =
    user?.firstName?.charAt(0)?.toUpperCase() || "?";

  const handleLogout = async () => {
    await logout();
    navigate("/login", { replace: true });
  };

  return (
    <div className="fixed inset-0 z-70 flex bg-black/20 backdrop-blur-sm">
      {/* Clickable backdrop only visible on md screens and above */}
      <button
        type="button"
        onClick={onClose}
        aria-label="Close profile"
        className="hidden flex-1 md:block"
      />

      <aside className="flex h-full w-full flex-col bg-(--color-surface) md:w-96 md:border-l md:border-(--color-border) md:shadow-2xl">
        <div className="flex h-16 shrink-0 items-center border-b border-(--color-border) px-4 md:px-6">
          <button
            type="button"
            onClick={onClose}
            aria-label="Close profile"
            className="flex h-10 w-10 items-center justify-center rounded-full text-(--color-text-secondary) transition hover:bg-(--color-background) hover:text-(--color-text)"
          >
            <ArrowLeft size={20} strokeWidth={1.8} />
          </button>

          <h1 className="ml-2 text-lg font-semibold text-(--color-text)">
            Profile
          </h1>
        </div>

        <div className="flex flex-1 flex-col px-5 py-8 md:px-6">
          <div className="flex flex-col items-center">
            <div className="flex h-24 w-24 items-center justify-center rounded-full bg-(--color-primary) text-3xl font-semibold text-white">
              {userInitial}
            </div>

            <h2 className="mt-5 text-xl font-semibold text-(--color-text)">
              {fullName}
            </h2>
          </div>

          <div className="mt-8 space-y-4">
            <div className="rounded-xl border border-(--color-border) bg-(--color-background) px-4 py-3">
              <p className="text-xs font-medium uppercase tracking-wide text-(--color-text-secondary)">
                Name
              </p>

              <p className="mt-1 truncate text-sm font-medium text-(--color-text)">
                {fullName}
              </p>
            </div>

            <div className="rounded-xl border border-(--color-border) bg-(--color-background) px-4 py-3">
              <p className="text-xs font-medium uppercase tracking-wide text-(--color-text-secondary)">
                Email
              </p>

              <p className="mt-1 break-all text-sm font-medium text-(--color-text)">
                {user?.email || "No email available"}
              </p>
            </div>
          </div>

          <div className="mt-auto pt-8">
            <button
              type="button"
              onClick={handleLogout}
              className="flex w-full items-center justify-center gap-2 rounded-xl border border-(--color-border) px-4 py-3 text-sm font-medium text-(--color-primary) transition hover:bg-(--color-background)"
            >
              <LogOut size={18} strokeWidth={1.8} />
              Log out
            </button>
          </div>
        </div>
      </aside>
    </div>
  );
};

export default Profile;