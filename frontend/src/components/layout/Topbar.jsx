import { Menu, Moon, Search, Sun } from "lucide-react";
import logo from "../../assets/logo.png";
import { useTheme } from "../../theme/ThemeContext";
import { useAuth } from "../../context/AuthContext";

const Topbar = ({ onMenuClick, searchQuery,onSearchChange}) => {
  const { theme, toggleTheme } = useTheme();
  const { user } = useAuth();

  const userInitial =
    user?.firstName?.charAt(0)?.toUpperCase() || "?";

  return (
    <header className="w-full shrink-0 border-b border-(--color-border) bg-(--color-surface)">
      <div className="hidden h-20 items-center gap-6 px-8 md:flex">
        {/* Search */}
        <div className="relative w-full max-w-3xl py-15">
          <Search
            size={20}
            strokeWidth={1.7}
            className="absolute left-5 top-1/2 -translate-y-1/2 text-(--color-text-secondary) "
          />

          <input
            type="text"
            placeholder="Search notes..."
            value={searchQuery}
            onChange={(e)=>{
              onSearchChange(e.target.value)
            }}
            className="h-12 w-full rounded-full border border-(--color-border) bg-(--color-background) pl-13 pr-5 text-base text-(--color-text) outline-none transition placeholder:text-(--color-text-secondary) focus:border-(--color-primary)"
          />
        </div>
        <div className="ml-auto flex shrink-0 items-center gap-4">
          <button
            type="button"
            onClick={toggleTheme}
            aria-label="Toggle theme"
            className="flex h-11 w-11 items-center justify-center rounded-full text-(--color-text-secondary) transition hover:bg-(--color-background) hover:text-(--color-text)"
          >
            {theme === "dark" ? (
              <Sun size={20} strokeWidth={1.7} />
            ) : (
              <Moon size={20} strokeWidth={1.7} />
            )}
          </button>
          <div
            className="flex h-11 w-11 items-center justify-center rounded-full bg-(--color-primary) text-sm font-semibold text-white"
            title={`${user?.firstName || ""} ${user?.lastName || ""}`.trim()}
          >
            {userInitial}
          </div>
        </div>
      </div>

      <div className="flex flex-col md:hidden">
        <div className="flex h-14 items-center gap-2 border-b border-(--color-border) px-4">
          <img
            src={logo}
            alt="Noto logo"
            className="h-10 w-10 object-contain"
          />
          <span className="text-2xl font-semibold tracking-[0.15em] text-(--color-text)">
            NOTO
          </span>
        </div>

        <div className="flex h-14  items-center gap-2 px-4 py-8">
          <div className="relative min-w-0 flex-1">
            <Search
              size={16}
              strokeWidth={1.7}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-(--color-text-secondary)"
            />
            <input
              type="text"
              placeholder="Search notes..."
              value={searchQuery}
              onChange={(e)=>{
                onSearchChange(e.target.value)
              }}
              className="h-10 w-full rounded-full border border-(--color-border) bg-(--color-background) pl-9 pr-3 text-sm text-(--color-text) outline-none placeholder:text-(--color-text-secondary) focus:border-(--color-primary)"
            />
          </div>
          <button
            type="button"
            onClick={toggleTheme}
            aria-label="Toggle theme"
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-(--color-text-secondary) transition hover:bg-(--color-background) hover:text-(--color-text)"
          >
            {theme === "dark" ? (
              <Sun size={19} strokeWidth={1.7} />
            ) : (
              <Moon size={19} strokeWidth={1.7} />
            )}
          </button>
          <button
            type="button"
            onClick={onMenuClick}
            aria-label="Open menu"
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-(--color-text) transition hover:bg-(--color-background)"
          >
            <Menu size={21} strokeWidth={1.8} />
          </button>
        </div>
      </div>
    </header>
  );
};
export default Topbar;