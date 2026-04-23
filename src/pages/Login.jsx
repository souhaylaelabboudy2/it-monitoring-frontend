import { useState } from "react";
import axios from "axios";

function Login({ onLogin, toggleTheme }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await axios.post("http://127.0.0.1:8000/api/login", { email, password });
      localStorage.setItem("token", res.data.token);
      onLogin();
    } catch (err) {
      if (err.response?.status === 403) {
        setError("Accès refusé — vous n'êtes pas autorisé");
      } else {
        setError("Email ou mot de passe incorrect");
      }
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900 text-black dark:text-white">
      <div className="flex justify-between items-center p-4">
        <h1 className="text-xl font-bold">Infrastructure Monitoring System</h1>
        <button onClick={toggleTheme} className="bg-gray-200 dark:bg-gray-700 px-3 py-1 rounded">
          Toggle Theme
        </button>
      </div>

      <div className="flex items-center justify-center mt-20">
        <div className="bg-gray-100 dark:bg-gray-800 p-8 rounded-2xl w-96 shadow-lg">
          <h2 className="text-2xl font-bold mb-2">Connexion</h2>
          <p className="text-gray-500 dark:text-gray-400 mb-6">Connectez-vous pour accéder aux données</p>
          {error && <p className="text-red-400 mb-4">{error}</p>}
          <form onSubmit={handleSubmit}>
            <input type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-gray-200 dark:bg-gray-700 text-black dark:text-white p-3 rounded-lg mb-4" />
            <input type="password" placeholder="Mot de passe" value={password} onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-gray-200 dark:bg-gray-700 text-black dark:text-white p-3 rounded-lg mb-6" />
            <button type="submit" className="w-full bg-blue-600 text-white p-3 rounded-lg hover:bg-blue-700">
              {loading ? "Chargement..." : "Se connecter"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

export default Login;