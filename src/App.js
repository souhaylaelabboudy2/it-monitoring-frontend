import { useState, useEffect } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./components/Dashboard";
import Alerts from "./components/Alerts";
import BackupDashboard from "./components/BackupDashboard";
import NvrDashboard from "./components/NvrDashboard";
import Incidents from "./components/Incidents";
import ReportsRSSI from "./pages/Reports/ReportsRSSI";
import Servers from "./pages/Servers";
import Footer from "./components/Footer";
import { NotificationProvider } from "./Context/NotificationContext";
import { NotificationCenterProvider } from "./Context/NotificationCenterContext";
import Toast from "./components/Toast";

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
    localStorage.removeItem("user");
    localStorage.removeItem("auth");

    sessionStorage.removeItem("token");
    sessionStorage.removeItem("user");
    sessionStorage.removeItem("auth");

    setIsLoggedIn(false);

    window.location.href = "/";
  };

  return (
    <NotificationCenterProvider>
      <NotificationProvider>
        <div className={darkMode ? "dark" : ""}>
          <BrowserRouter>
            <Routes>
          <Route
            path="/"
            element={<Home toggleTheme={toggleTheme} />}
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
            path="/register"
            element={
              isLoggedIn ? (
                <Navigate to="/dashboard" replace />
              ) : (
                <Register onLogin={() => setIsLoggedIn(true)} toggleTheme={toggleTheme} />
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
                <Servers onLogout={handleLogout} toggleTheme={toggleTheme} />
              </ProtectedRoute>
            }
          />
          <Route
            path="/alerts"
            element={
              <ProtectedRoute isLoggedIn={isLoggedIn}>
                <Alerts onLogout={handleLogout} toggleTheme={toggleTheme} />
              </ProtectedRoute>
            }
          />
          <Route
            path="/backups"
            element={
              <ProtectedRoute isLoggedIn={isLoggedIn}>
                <BackupDashboard onLogout={handleLogout} toggleTheme={toggleTheme} />
              </ProtectedRoute>
            }
          />
          <Route
            path="/nvr"
            element={
              <ProtectedRoute isLoggedIn={isLoggedIn}>
                <NvrDashboard onLogout={handleLogout} toggleTheme={toggleTheme} />
              </ProtectedRoute>
            }
          />
          <Route
            path="/incidents"
            element={
              <ProtectedRoute isLoggedIn={isLoggedIn}>
                <Incidents onLogout={handleLogout} toggleTheme={toggleTheme} />
              </ProtectedRoute>
            }
          />
          <Route
            path="/reports"
            element={
              <ProtectedRoute isLoggedIn={isLoggedIn}>
                <ReportsRSSI onLogout={handleLogout} toggleTheme={toggleTheme} />
              </ProtectedRoute>
            }
          />
        </Routes>
      </BrowserRouter>
      <Toast />
      <Footer />
    </div>
    </NotificationProvider>
    </NotificationCenterProvider>
  );
}

export default App;