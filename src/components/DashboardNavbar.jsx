import { useLocation, useNavigate } from "react-router-dom";
import logo from "../imgs/mono_logo.png";
import NotificationBell from "./NotificationBell";

function DashboardNavbar({ onLogout, toggleTheme }) {
  const navigate = useNavigate();
  const location = useLocation();

  const navItems = [
    { label: "Dashboard", path: "/dashboard" },
    { label: "Servers", path: "/servers" },
    { label: "NVRs", path: "/nvr" },
    { label: "Backups", path: "/backups" },
    { label: "Alerts", path: "/alerts" },
    { label: "Incidents", path: "/incidents" },
    { label: "Reports", path: "/reports" },
  ];

  const isActive = (path) => {
    return location.pathname === path;
  };

  const handleLogout = () => {
    navigate("/", { replace: true });
    onLogout();
  };

  return (
    <nav className="sticky top-0 z-50 bg-slate-900 dark:bg-black text-white shadow-lg border-b-2 border-red-600">
      <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
        {/* LEFT: Logo */}
        <div className="flex items-center gap-3 min-w-fit">
          <img src={logo} alt="Monitoring System" className="h-8 w-8 object-contain transform scale-150" />
          <div className="animate-pulse">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-slate-400">Infrastructure</span>
              <span className="text-xs font-bold text-red-600 animate-bounce" style={{animationDelay: "0.1s"}}>Monitoring</span>
              <span className="text-xs font-bold text-slate-400">System</span>
            </div>
            <div className="h-1 bg-gradient-to-r from-red-600 to-transparent rounded-full mt-1"></div>
          </div>
        </div>

        {/* CENTER: Navigation Links */}
        <div className="hidden md:flex gap-1 flex-1 justify-center px-6">
          {navItems.map((item) => (
            <button
              key={item.path}
              onClick={() => navigate(item.path)}
              className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                isActive(item.path)
                  ? "bg-red-600 text-white"
                  : "text-slate-300 hover:text-red-500 hover:bg-slate-800"
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>

        {/* RIGHT: Notifications, Theme Toggle & Logout */}
        <div className="flex items-center gap-3">
          <NotificationBell />
          <button
            onClick={toggleTheme}
            className="p-2 rounded-lg text-slate-300 hover:text-red-500 hover:bg-slate-800 transition"
            title="Toggle Theme"
          >
            🌓
          </button>
          <button
            onClick={handleLogout}
            className="px-4 py-2 bg-red-600 text-white text-sm font-semibold rounded-lg hover:bg-red-700 transition"
          >
            Logout
          </button>
        </div>

        {/* MOBILE MENU BUTTON */}
        <div className="md:hidden flex items-center gap-2">
          <details className="group">
            <summary className="list-none cursor-pointer px-3 py-2 rounded-lg text-slate-300 hover:text-red-500 hover:bg-slate-800 transition">
              ☰
            </summary>
            <div className="absolute right-0 top-16 bg-slate-800 rounded-lg shadow-lg p-2 group-open:block hidden w-48">
              {navItems.map((item) => (
                <button
                  key={item.path}
                  onClick={() => navigate(item.path)}
                  className={`w-full text-left px-3 py-2 rounded-md text-sm font-medium transition-colors block ${
                    isActive(item.path)
                      ? "bg-red-600 text-white"
                      : "text-slate-300 hover:text-red-500 hover:bg-slate-700"
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </div>
          </details>
        </div>
      </div>
    </nav>
  );
}

export default DashboardNavbar;
