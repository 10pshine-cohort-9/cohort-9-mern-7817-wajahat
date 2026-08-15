import { MoreVertical, Star } from "lucide-react";

const NoteCard = ({
  title,
  content,
  updatedAt,
  isStarred = false,
}) => {
  return (
    <article className="flex min-h-51.25 flex-col rounded-2xl border border-(--color-border) bg-(--color-surface) p-6 shadow-[0_2px_8px_rgba(0,0,0,0.05)] transition duration-200 hover:-translate-y-0.5 hover:shadow-[0_6px_18px_rgba(0,0,0,0.08)]">
      <div className="flex items-start justify-between gap-4">
        <h3 className="line-clamp-1 text-base font-bold tracking-[-0.01em] text-(--color-primary)">
          {title}
        </h3>
        <button
          type="button"
          aria-label={isStarred ? "Unstar note" : "Star note"}
          className="shrink-0 text-(--color-primary) transition hover:scale-110"
        >
          <Star
            size={19}
            strokeWidth={1.8}
            fill={isStarred ? "currentColor" : "none"}
          />
        </button>
      </div>
      <p className="mt-4 line-clamp-3 max-w-[90%] text-sm leading-6 text-(--color-text-secondary)">
        {content}
      </p>
      <div className="mt-auto flex items-center justify-between pt-8">
        <span className="text-xs font-medium text-(--color-text-secondary)">
          {updatedAt}
        </span>
        <button
          type="button"
          aria-label="More options"
          className="flex h-8 w-8 items-center justify-center rounded-lg text-(--color-text-secondary) transition hover:bg-(--color-background) hover:text-(--color-text)"
        >
          <MoreVertical size={18} strokeWidth={1.8} />
        </button>
      </div>
    </article>
  );
};
export default NoteCard;