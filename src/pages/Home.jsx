import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import logo from "../imgs/mono_logo.png";

function LandingPage({ toggleTheme }) {
  const navigate = useNavigate();
  const [darkMode, setDarkMode] = useState(false);

  useEffect(() => {
    const theme = localStorage.getItem("theme");
    if (theme) setDarkMode(theme === "dark");
  }, []);

  const scrollToSection = (id) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
  };

  const navItems = [
    { label: "Our Platform", id: "platform" },
    { label: "What We Use", id: "technologies" },
    { label: "Features", id: "features" },
    { label: "Contact", id: "contact" },
  ];

  return (
    <div className={darkMode ? "dark" : ""}>
      <div className="min-h-screen bg-white dark:bg-slate-950 text-slate-950 dark:text-white">
        {/* NAVBAR */}
        <nav className="sticky top-0 z-50 bg-slate-900 dark:bg-black text-white shadow-lg overflow-visible">
          <div className="max-w-7xl mx-auto px-6 py-2 flex items-center justify-between">
            {/* Logo and Title */}
            <div className="flex items-center gap-3">
              <img src={logo} alt="Monitoring System" className="h-12 w-12 object-contain transform scale-150" />
              <div className="hidden sm:block animate-pulse">
                <div className="flex items-center gap-2">
                  <h2 className="text-xs font-bold text-white">Infrastructure</h2>
                  <span className="text-xs font-bold text-red-600 animate-bounce" style={{animationDelay: "0.1s"}}>Monitoring</span>
                  <h2 className="text-xs font-bold text-white">System</h2>
                </div>
                <div className="h-1 bg-gradient-to-r from-red-600 to-transparent rounded-full mt-1"></div>
              </div>
            </div>

            {/* Center Navigation */}
            <div className="hidden md:flex gap-8">
              {navItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => scrollToSection(item.id)}
                  className="text-slate-300 hover:text-red-500 transition-colors text-sm font-medium"
                >
                  {item.label}
                </button>
              ))}
            </div>

            {/* Right Actions */}
            <div className="flex gap-2 items-center">
              <button
                onClick={toggleTheme}
                className="px-3 py-2 text-xs rounded-lg hover:bg-slate-800 transition"
              >
                🌓
              </button>
              <button
                onClick={() => navigate("/login")}
                className="px-3 py-2 border-2 border-red-600 text-red-600 text-xs font-semibold rounded-lg hover:bg-red-600 hover:text-white transition"
              >
                Sign In
              </button>
              <button
                onClick={() => navigate("/register")}
                className="px-3 py-2 bg-red-600 text-white text-xs font-semibold rounded-lg hover:bg-red-700 transition"
              >
                Sign Up
              </button>
            </div>
          </div>
        </nav>

        {/* HERO SECTION */}
        <section className="bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 py-20 md:py-32">
          <div className="max-w-7xl mx-auto px-6 text-center">
            <h1 className="text-5xl md:text-6xl font-bold mb-6 text-slate-900 dark:text-white">
              Infrastructure Monitoring System
            </h1>
            <p className="text-lg md:text-xl text-slate-600 dark:text-slate-300 mb-12 max-w-2xl mx-auto">
              A secure IT monitoring platform for supervising servers, backups, NVR systems, alerts, incidents, and RSSI reporting.
            </p>
            <div className="flex flex-col md:flex-row gap-4 justify-center">
              <button
                onClick={() => navigate("/login")}
                className="px-8 py-3 bg-red-600 text-white font-semibold rounded-lg hover:bg-red-700 transition shadow-lg"
              >
                Sign In
              </button>
              <button
                onClick={() => navigate("/register")}
                className="px-8 py-3 border-2 border-red-600 text-red-600 font-semibold rounded-lg hover:bg-red-50 dark:hover:bg-slate-800 transition"
              >
                Sign Up
              </button>
            </div>
          </div>
        </section>

        {/* SECTION 1: OUR PLATFORM */}
        <section id="platform" className="py-16 md:py-24 bg-white dark:bg-slate-950 border-t border-slate-200 dark:border-slate-800">
          <div className="max-w-7xl mx-auto px-6">
            <div className="text-center mb-12">
              <p className="text-sm uppercase tracking-[0.2em] text-red-600 font-semibold mb-2">OUR PLATFORM</p>
              <h2 className="text-4xl md:text-5xl font-bold text-slate-900 dark:text-white mb-6">
                Designed for IT Teams
              </h2>
              <p className="text-lg text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
                Used by IT administrators, RSSI/security managers, and infrastructure teams in enterprises worldwide.
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {[
                { icon: "🎯", title: "Centralized Monitoring", desc: "Manage all infrastructure from a single dashboard" },
                { icon: "👁️", title: "Real-Time Visibility", desc: "See status and metrics instantly across all systems" },
                { icon: "🚨", title: "Security Alerting", desc: "Receive notifications for critical issues immediately" },
                { icon: "📋", title: "Incident Tracking", desc: "Log, track, and resolve issues systematically" },
                { icon: "📊", title: "Automated Reports", desc: "Generate RSSI reports and export to PDF" },
                { icon: "🔒", title: "Enterprise-Grade", desc: "Secure, scalable solution for large deployments" },
              ].map((item, idx) => (
                <div
                  key={idx}
                  className="rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 p-8 hover:shadow-lg transition"
                >
                  <div className="text-4xl mb-4">{item.icon}</div>
                  <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">{item.title}</h3>
                  <p className="text-slate-600 dark:text-slate-400">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* SECTION 2: WHAT WE USE */}
        <section id="technologies" className="py-16 md:py-24 bg-slate-50 dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800">
          <div className="max-w-7xl mx-auto px-6">
            <div className="text-center mb-12">
              <p className="text-sm uppercase tracking-[0.2em] text-red-600 font-semibold mb-2">TECH STACK</p>
              <h2 className="text-4xl md:text-5xl font-bold text-slate-900 dark:text-white mb-6">
                Built on Proven Technologies
              </h2>
              <p className="text-lg text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
                Modern, reliable, and enterprise-tested tools and frameworks.
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              {[
                { name: "React", icon: "⚛️", desc: "Modern UI framework" },
                { name: "Laravel", icon: "🚀", desc: "Robust backend API" },
                { name: "MySQL", icon: "🗄️", desc: "Reliable database" },
                { name: "Zabbix", icon: "📡", desc: "Enterprise monitoring" },
                { name: "Python", icon: "🐍", desc: "Automation & scripting" },
                { name: "Docker", icon: "🐳", desc: "Container orchestration" },
                { name: "jsPDF", icon: "📄", desc: "PDF generation" },
                { name: "Chart.js", icon: "📈", desc: "Data visualization" },
              ].map((tech, idx) => (
                <div
                  key={idx}
                  className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-6 text-center hover:shadow-md transition"
                >
                  <div className="text-3xl mb-3">{tech.icon}</div>
                  <h3 className="font-bold text-slate-900 dark:text-white mb-1">{tech.name}</h3>
                  <p className="text-sm text-slate-600 dark:text-slate-400">{tech.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* SECTION 3: FEATURES */}
        <section id="features" className="py-16 md:py-24 bg-white dark:bg-slate-950 border-t border-slate-200 dark:border-slate-800">
          <div className="max-w-7xl mx-auto px-6">
            <div className="text-center mb-12">
              <p className="text-sm uppercase tracking-[0.2em] text-red-600 font-semibold mb-2">CAPABILITIES</p>
              <h2 className="text-4xl md:text-5xl font-bold text-slate-900 dark:text-white mb-6">
                Comprehensive Monitoring
              </h2>
              <p className="text-lg text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
                Everything needed to manage and monitor modern infrastructure.
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[
                "🖥️ Server Monitoring",
                "💾 Backup Monitoring",
                "📹 NVR Standard Monitoring",
                "📹 NVR Master Monitoring",
                "🔔 Alert System",
                "⚠️ Incident Management",
                "📋 Logs & Journalisation",
                "📊 RSSI Reports",
                "📄 PDF Export",
                "🔐 Protected Dashboard",
                "📱 Real-Time Notifications",
                "🎨 Light/Dark Theme",
              ].map((feature, idx) => (
                <div
                  key={idx}
                  className="rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 p-6 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
                >
                  <p className="text-lg font-semibold text-slate-900 dark:text-white">{feature}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* SECTION 4: CONTACT */}
        <section id="contact" className="py-16 md:py-24 bg-slate-50 dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800">
          <div className="max-w-7xl mx-auto px-6">
            <div className="text-center mb-12">
              <p className="text-sm uppercase tracking-[0.2em] text-red-600 font-semibold mb-2">GET IN TOUCH</p>
              <h2 className="text-4xl md:text-5xl font-bold text-slate-900 dark:text-white mb-6">
                Contact Information
              </h2>
              <p className="text-lg text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
                Reach out to our team for support or inquiries.
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-8 max-w-3xl mx-auto">
              <div className="rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-8 text-center">
                <div className="text-3xl mb-4">✉️</div>
                <h3 className="font-bold text-slate-900 dark:text-white mb-2">Email</h3>
                <p className="text-slate-600 dark:text-slate-400 break-all">
                  contact@infrastructure-monitoring.local
                </p>
              </div>
              <div className="rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-8 text-center">
                <div className="text-3xl mb-4">📞</div>
                <h3 className="font-bold text-slate-900 dark:text-white mb-2">Phone</h3>
                <p className="text-slate-600 dark:text-slate-400">+212 000 000 000</p>
              </div>
              <div className="rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-8 text-center">
                <div className="text-3xl mb-4">🏢</div>
                <h3 className="font-bold text-slate-900 dark:text-white mb-2">Department</h3>
                <p className="text-slate-600 dark:text-slate-400">IT / RSSI</p>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}

export default LandingPage;