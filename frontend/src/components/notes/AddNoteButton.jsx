import { Plus } from "lucide-react";

const AddNoteButton = ({ onClick }) => {
  return (
    <button
      type="button"
      onClick={onClick}
      className="fixed bottom-22 right-13 z-52 flex items-center gap-2 rounded-xl bg-(--color-primary) px-5 py-3 text-md font-medium text-white shadow-md transition hover:bg-(--color-primary-hover) hover:shadow-lg md:bottom-13 md:right-15"
    >
      <Plus size={18} strokeWidth={2} />
      <span>ADD NEW NOTE</span>
    </button>
  );
};

export default AddNoteButton;