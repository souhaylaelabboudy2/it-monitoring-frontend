import { useState, useEffect } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Dashboard from "./components/Dashboard";
import Alerts from "./components/Alerts";
import BackupDashboard from "./components/BackupDashboard";
import NvrDashboard from "./components/NvrDashboard";
import Incidents from "./components/Incidents";
import ReportsRSSI from "./pages/Reports/ReportsRSSI";

function ProtectedRoute({ isLoggedIn, children }) {
  return isLoggedIn ? children : <Navigate to="/login" replace />;
}

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
      <BrowserRouter>
        <Routes>
          <Route
            path="/"
            element={
              isLoggedIn ? (
                <Home onLogout={handleLogout} toggleTheme={toggleTheme} />
              ) : (
                <Login onLogin={() => setIsLoggedIn(true)} toggleTheme={toggleTheme} />
              )
            }
          />
          <Route
            path="/login"
            element={
              isLoggedIn ? (
                <Navigate to="/dashboard" replace />
              ) : (
                <Login onLogin={() => setIsLoggedIn(true)} toggleTheme={toggleTheme} />
              )
            }
          />
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute isLoggedIn={isLoggedIn}>
                <Dashboard onLogout={handleLogout} toggleTheme={toggleTheme} />
              </ProtectedRoute>
            }
          />
          <Route
            path="/servers"
            element={
              <ProtectedRoute isLoggedIn={isLoggedIn}>
                <Dashboard onLogout={handleLogout} toggleTheme={toggleTheme} />
              </ProtectedRoute>
            }
          />
          <Route
            path="/alerts"
            element={
              <ProtectedRoute isLoggedIn={isLoggedIn}>
                <Alerts />
              </ProtectedRoute>
            }
          />
          <Route
            path="/backups"
            element={
              <ProtectedRoute isLoggedIn={isLoggedIn}>
                <BackupDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/nvr"
            element={
              <ProtectedRoute isLoggedIn={isLoggedIn}>
                <NvrDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/incidents"
            element={
              <ProtectedRoute isLoggedIn={isLoggedIn}>
                <Incidents />
              </ProtectedRoute>
            }
          />
          <Route
            path="/reports"
            element={
              <ProtectedRoute isLoggedIn={isLoggedIn}>
                <ReportsRSSI toggleTheme={toggleTheme} />
              </ProtectedRoute>
            }
          />
        </Routes>
      </BrowserRouter>
    </div>
  );
}

export default App;