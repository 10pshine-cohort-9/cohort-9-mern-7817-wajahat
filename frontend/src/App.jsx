import React from "react";
import { useTheme } from "./theme/ThemeContext";

const App = () => {
  const { theme, toggleTheme } = useTheme();

  return (
    <div
      className="
        min-h-screen
        bg-[var(--color-background)]
        text-[var(--color-text)]
        p-10
        transition-colors
      "
    >
      <h1 className="text-3xl font-bold">Noto</h1>

      <p className="mt-2 text-[var(--color-text-secondary)]">
        Where thoughts take shape.
      </p>

      <p className="mt-6">
        Current theme: <strong>{theme}</strong>
      </p>

      <button
        onClick={toggleTheme}
        className="
          mt-4
          rounded-lg
          bg-[var(--color-primary)]
          px-5
          py-2
          text-white
          hover:bg-[var(--color-primary-hover)]
        "
      >
        {theme === "light" ? "🌙 Switch to Dark" : "☀️ Switch to Light"}
      </button>
    </div>
  );
};

export default App;