import Dashboard from "../components/Dashboard";

function Home({ onLogout, toggleTheme }) {
  return <Dashboard onLogout={onLogout} toggleTheme={toggleTheme} />;
}

export default Home;