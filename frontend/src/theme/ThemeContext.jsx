import { createContext, useContext, useEffect, useMemo, useCallback, useState } from "react";
import { themes } from "./theme";

const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
  const [theme, setTheme] = useState("light");

  useEffect(() => {
    const selectedTheme = themes[theme] || themes.light;

    if (selectedTheme) {
      Object.entries(selectedTheme).forEach(([property, value]) => {
        document.documentElement.style.setProperty(property, value);
      });
    }

    document.documentElement.setAttribute("data-theme", theme);
  }, [theme]);

  //validated that customer can only toggl between light and dark theme like pre defined ones
    const changeTheme = useCallback((newTheme) => {
    if (themes[newTheme]) {
      setTheme(newTheme);
    } else {
      console.warn(`Invalid theme requested: ${newTheme}`);
    }
  }, []);

    const toggleTheme = useCallback(() => {
    setTheme((currentTheme) =>
      currentTheme === "light" ? "dark" : "light"
    );
  }, []);

    const value = useMemo(
    () => ({
      theme,
      setTheme: changeTheme,
      toggleTheme,
    }),
    [theme, changeTheme, toggleTheme]
  );

  return (
    <ThemeContext.Provider
      value={value}
    >
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);

  if (!context) {
    throw new Error("useTheme must be used inside ThemeProvider");
  }

  return context;
};