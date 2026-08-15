import { BookOpen } from "lucide-react";

const Loader = ({ message = "Loading notes..." }) => {
  return (
    <div className="flex min-h-[240px] w-full flex-col items-center justify-center">
      <div className="relative flex h-16 w-16 items-center justify-center">
        <div className="relative h-12 w-10 [perspective:500px]">
          <div className="absolute inset-0 rounded-r-md border-2 border-(--color-primary) bg-(--color-primary) opacity-90" />
          <div className="absolute left-1 top-0 h-12 w-8 origin-left animate-[pageFlip_1.4s_ease-in-out_infinite] rounded-r-sm border border-(--color-border) bg-(--color-surface)">
            <div className="mt-3 space-y-1.5 px-2">
              <span className="block h-0.5 w-4 rounded bg-(--color-border)" />
              <span className="block h-0.5 w-5 rounded bg-(--color-border)" />
              <span className="block h-0.5 w-3 rounded bg-(--color-border)" />
            </div>
          </div>
          <div className="absolute left-1 top-0 h-12 w-8 rounded-r-sm border border-(--color-border) bg-(--color-surface)">
            <div className="mt-3 space-y-1.5 px-2">
              <span className="block h-0.5 w-5 rounded bg-(--color-primary) opacity-60" />
              <span className="block h-0.5 w-4 rounded bg-(--color-border)" />
              <span className="block h-0.5 w-5 rounded bg-(--color-border)" />
            </div>
          </div>
          <div className="absolute left-0 top-0 h-12 w-1 rounded-l-sm bg-(--color-primary)" />
        </div>
        <div className="absolute -right-1 -top-1 animate-[floatPage_1.6s_ease-in-out_infinite]">
          <BookOpen
            size={15}
            strokeWidth={1.7}
            className="text-(--color-accent)"
          />
        </div>
      </div>

      <p className="mt-4 text-sm font-medium text-(--color-text-secondary)">
        {message}
      </p>
    </div>
  );
};

export default Loader;