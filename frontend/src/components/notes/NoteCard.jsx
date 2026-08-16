import { useState } from "react";
import { Star, Trash2 } from "lucide-react";
import {
  deleteNote,
  updateStarStatus,
} from "../../services/notesService";
const NoteCard = ({
  id,
  title,
  content,
  updatedAt,
  isStarred = false,
  onDelete,
  onStarChange,
  onClick,
}) => {
  const [deleting, setDeleting] = useState(false);
  const [updatingStar, setUpdatingStar] = useState(false);
  const handleStarToggle = async () => {
    if (updatingStar) return;
    const newStarStatus = !isStarred;
    try {
      setUpdatingStar(true);
      const response = await updateStarStatus(id, newStarStatus);
      const updatedNote = response.data?.data;
      if (onStarChange) {
        onStarChange(
          updatedNote || {
            isStarred: newStarStatus,
          }
        );
      }
    } catch (error) {
      console.error("Failed to update star status:", error);
    } finally {
      setUpdatingStar(false);
    }
  };
  const handleDelete = async () => {
    if (deleting) return;
    try {
      setDeleting(true);
      await deleteNote(id);
      if (onDelete) {
        onDelete(id);
      }
    } catch (error) {
      console.error("Failed to delete note:", error);
    } finally {
      setDeleting(false);
    }
  };
  return (
    <article
      onClick={onClick}
      className="flex min-h-51.25 cursor-pointer flex-col rounded-2xl border border-(--color-border) bg-(--color-surface) p-6 shadow-[0_2px_8px_rgba(0,0,0,0.05)] transition duration-200 hover:-translate-y-0.5 hover:shadow-[0_6px_18px_rgba(0,0,0,0.08)]"
    >
      <div className="flex items-start justify-between gap-4">
        <h3 className="line-clamp-1 text-base font-bold tracking-[-0.01em] text-(--color-primary)">
          {title}
        </h3>
        <button
          type="button"
          onClick={(event) => {
            event.stopPropagation();
            handleStarToggle();
          }}
          disabled={updatingStar}
          aria-label={isStarred ? "Unstar note" : "Star note"}
          title={isStarred ? "Unstar note" : "Star note"}
          className={`shrink-0 text-(--color-primary) transition ${
            updatingStar
              ? "cursor-not-allowed opacity-50"
              : "hover:scale-110"
          }`}
        >
          <Star
            size={20}
            strokeWidth={1.8}
            fill={isStarred ? "currentColor" : "none"}
          />
        </button>
      </div>
      <div
        className="note-content mt-4 line-clamp-4 max-w-[90%] text-sm leading-6 text-(--color-text-secondary)"
        dangerouslySetInnerHTML={{
          __html: content || "",
        }}
      />
      <div className="mt-auto flex items-center justify-between pt-8">
        <span className="text-xs font-medium text-(--color-text-secondary)">
          {updatedAt}
        </span>
        <button
          type="button"
          onClick={(event) => {
            event.stopPropagation();
            handleDelete();
          }}
          disabled={deleting}
          aria-label="Delete note"
          title="Delete note"
          className="flex h-8 w-8 items-center justify-center rounded-lg text-(--color-text-secondary) transition hover:bg-red-500/10 hover:text-red-500 disabled:cursor-not-allowed disabled:opacity-40"
        >
          <Trash2 size={18} strokeWidth={1.8} />
        </button>
      </div>
    </article>
  );
};
export default NoteCard;