import {
  FileText,
  Star,
  Trash2,
  Settings,
} from "lucide-react";
import logo from "../../assets/logo.png";
import DesktopNavButton from "./DesktopNavButton";
import MobileNavButton from "./MobileNavButton";

const items = [
  {
    id: "notes",
    name: "All Notes",
    icon: FileText,
  },
  {
    id: "starred",
    name: "Starred",
    icon: Star,
  },
  
];

const Navigation = ({ activeItem, onNavigate }) => {
  return (
    <>
      <aside className="hidden h-screen w-60 shrink-0 flex-col border-r border-(--color-border) bg-(--color-surface) px-4 py-8 md:flex">
        {/* Logo */}
        <div className="mb-8 flex items-center gap-2 px-1">
          <img
            src={logo}
            alt="Noto logo"
            className="h-10 w-10 object-contain"
          />

          <span className="text-2xl font-semibold tracking-[0.15em] text-(--color-text)">
            NOTO
          </span>
        </div>
        <nav className="space-y-2">
          {items.map((item) => (
            <DesktopNavButton
              key={item.id}
              item={item}
              active={activeItem === item.id}
              onClick={onNavigate}
            />
          ))}
        </nav>
        <div className="mt-auto border-t border-(--color-border) pt-4">
          <button
            type="button"
            className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-(--color-text) transition hover:bg-(--color-background)"
          >
            <Settings size={17} strokeWidth={1.8} />
            Settings
          </button>
        </div>
      </aside>
      <nav className="fixed bottom-0 left-0 right-0 z-50 flex h-16 items-center justify-around border-t border-(--color-border) bg-(--color-surface) px-4 md:hidden">
        {items.map((item) => (
          <MobileNavButton
            key={item.id}
            item={item}
            active={activeItem === item.id}
            onClick={onNavigate}
          />
        ))}
      </nav>
    </>
  );
};
export default Navigation;