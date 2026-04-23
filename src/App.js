import { useState, useEffect } from "react";
import Home from "./pages/Home";
import Login from "./pages/Login";

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [darkMode, setDarkMode] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) setIsLoggedIn(true);
    const saved = localStorage.getItem("theme");
    if (saved) setDarkMode(saved === "dark");
  }, []);

  const toggleTheme = () => {
    setDarkMode(!darkMode);
    localStorage.setItem("theme", !darkMode ? "dark" : "light");
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    setIsLoggedIn(false);
  };

  return (
    <div className={darkMode ? "dark" : ""}>
      {isLoggedIn ? (
        <Home onLogout={handleLogout} toggleTheme={toggleTheme} />
      ) : (
        <Login onLogin={() => setIsLoggedIn(true)} toggleTheme={toggleTheme} />
      )}
    </div>
  );
}

export default App;