import { useState, useEffect } from "react";
import Home from "./pages/Home";

function App() {
  const [darkMode, setDarkMode] = useState(true);

  useEffect(() => {
    const saved = localStorage.getItem("theme");
    if (saved) setDarkMode(saved === "dark");
  }, []);

  const toggleTheme = () => {
    setDarkMode(!darkMode);
    localStorage.setItem("theme", !darkMode ? "dark" : "light");
  };

  return (
    <div className={darkMode ? "dark" : ""}>
      <button onClick={toggleTheme}>
        Toggle Theme
      </button>
      <Home />
    </div>
  );
}

export default App;