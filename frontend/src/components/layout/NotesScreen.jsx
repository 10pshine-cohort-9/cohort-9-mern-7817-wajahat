import NoteCard from "../notes/NoteCard";

const notes = [
  {
    id: 1,
    title: "Database Indexes",
    content:
      "Understanding how indexes improve database query performance...",
    updatedAt: "Updated 2 hours ago",
    isStarred: true,
  },
  {
    id: 2,
    title: "Project Ideas",
    content:
      "Some ideas for the upcoming full stack projects that we can build...",
    updatedAt: "Updated yesterday",
    isStarred: false,
  },
  {
    id: 3,
    title: "Interview Preparation",
    content:
      "DSA, System Design, and some important behavioral questions...",
    updatedAt: "Updated 2 days ago",
    isStarred: false,
  },
  {
    id: 4,
    title: "React Best Practices",
    content:
      "Important points to remember while building scalable React apps...",
    updatedAt: "Updated 3 days ago",
    isStarred: false,
  },
];

const NotesScreen = () => {
  return (
    <section className="w-full px-7 gap-10">
      {/* Header */}
      <div className="mb-7 flex items-end justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-[-0.02em] text-(--color-text) md:text-3xl">
            All Notes
          </h1>

          <p className="mt-1.5 text-sm font-medium text-(--color-text-secondary)">
            {notes.length} notes
          </p>
        </div>
      </div>

      {/* Notes */}
      <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
        {notes.map((note) => (
          <NoteCard
            key={note.id}
            title={note.title}
            content={note.content}
            updatedAt={note.updatedAt}
            isStarred={note.isStarred}
          />
        ))}
      </div>
    </section>
  );
};

export default NotesScreen;