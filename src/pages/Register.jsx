import { useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../services/api";

function Register({ onLogin, toggleTheme }) {
  const navigate = useNavigate();
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!fullName || !email || !password || !confirmPassword) {
      setError("All fields are required");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }

    setLoading(true);
    try {
      const res = await API.post("/register", { name: fullName, email, password, password_confirmation: confirmPassword });
      // If registration includes token response, auto-login
      if (res.data?.token) {
        localStorage.setItem("token", res.data.token);
        onLogin();
        setError("");
        navigate("/dashboard", { replace: true });
      } else {
        // Otherwise redirect to login
        setError("");
        navigate("/login", { replace: true });
      }
    } catch (err) {
      if (err.response?.data?.message) {
        setError(err.response.data.message);
      } else if (err.response?.status === 422) {
        setError("Email already in use or invalid data");
      } else {
        setError("Registration failed");
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

      <div className="flex items-center justify-center mt-12">
        <div className="bg-gray-100 dark:bg-gray-800 p-8 rounded-2xl w-96 shadow-lg">
          <h2 className="text-2xl font-bold mb-2">Register</h2>
          <p className="text-gray-500 dark:text-gray-400 mb-6">Create your account to access the system</p>
          {error && <p className="text-red-400 mb-4 text-sm">{error}</p>}
          <form onSubmit={handleSubmit}>
            <input
              type="text"
              placeholder="Full name"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className="w-full bg-gray-200 dark:bg-gray-700 text-black dark:text-white p-3 rounded-lg mb-4"
            />
            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-gray-200 dark:bg-gray-700 text-black dark:text-white p-3 rounded-lg mb-4"
            />
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-gray-200 dark:bg-gray-700 text-black dark:text-white p-3 rounded-lg mb-4"
            />
            <input
              type="password"
              placeholder="Confirm password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full bg-gray-200 dark:bg-gray-700 text-black dark:text-white p-3 rounded-lg mb-6"
            />
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-red-600 text-white p-3 rounded-lg hover:bg-red-700 disabled:opacity-50"
            >
              {loading ? "Registering..." : "Register"}
            </button>
          </form>
          <p className="text-center text-gray-600 dark:text-gray-400 text-sm mt-4">
            Already have an account?{" "}
            <button
              onClick={() => navigate("/login")}
              className="text-red-600 hover:text-red-700 font-semibold"
            >
              Sign in
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}

export default Register;
