import React from "react";
import { useTheme } from "./theme/ThemeContext";
import AppRoutes from "./routes/AppRoutes";

const App = () => {
  //const { theme, toggleTheme } = useTheme();
    return (
      <AppRoutes/>
    );
};

export default App;