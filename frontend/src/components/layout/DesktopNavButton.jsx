const DesktopNavButton = ({ item, active, onClick }) => {
  const Icon = item.icon;

  return (
    <button
      type="button"
      onClick={() => onClick(item.id)}
      className={`flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition ${
        active
          ? "bg-(--color-primary)/10 font-medium text-(--color-primary)"
          : "text-(--color-text) hover:bg-(--color-background)"
      }`}
    >
      <Icon size={17} strokeWidth={1.8} />
      {item.name}
    </button>
  );
};

export default DesktopNavButton;