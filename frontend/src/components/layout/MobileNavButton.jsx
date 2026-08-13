const MobileNavButton = ({ item, active, onClick }) => {
  const Icon = item.icon;

  return (
    <button
      type="button"
      onClick={() => onClick(item.id)}
      className={`flex flex-col items-center gap-1 rounded-lg px-4 py-2 transition ${
        active
          ? "bg-(--color-primary)/10 text-(--color-primary)"
          : "text-(--color-text-secondary)"
      }`}
    >
      <Icon size={19} strokeWidth={1.8} />
      <span className="text-[10px]">{item.name}</span>
    </button>
  );
};

export default MobileNavButton;