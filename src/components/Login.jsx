import { useState } from "react";
import { useNavigate } from "react-router-dom";

// Use your local backend
const API_URL = "http://localhost:5000/users";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Fetch users from your backend with the given email
      const res = await fetch(`${API_URL}?email=${email}`);
      const users = await res.json();

      if (users.length === 0) {
        alert("Email not found. Please signup first.");
        setLoading(false);
        return;
      }

      const user = users[0];

      // Check password
      if (user.password !== password) {
        alert("Invalid password");
        setLoading(false);
        return;
      }

      // Save user data
      localStorage.setItem("token", "dummy-token"); // placeholder token
      localStorage.setItem("currentUser", JSON.stringify(user));

      alert("Login successful!");
      navigate("/dashboard");
    } catch (err) {
      console.error("Login error:", err);
      alert("Login failed. Try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      <form onSubmit={handleLogin} className="login-form">
        <h2>🔑 Login</h2>

        <input 
          type="email" 
          placeholder="Email" 
          value={email} 
          onChange={(e) => setEmail(e.target.value)} 
          required 
        />

        <input 
          type="password" 
          placeholder="Password" 
          value={password} 
          onChange={(e) => setPassword(e.target.value)} 
          required 
        />

        <button type="submit" disabled={loading}>
          {loading ? "Logging in..." : "Login"}
        </button>

        <p className="signup-link">
          Don't have an account? 
          <span onClick={() => navigate("/signup")}> Signup</span>
        </p>
      </form>

      <style>{`
        .login-page {
          display: flex;
          justify-content: center;
          align-items: center;
          min-height: 100vh;
          background: linear-gradient(135deg, #e0f7fa, #f1f8e9);
          font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
        }
        .login-form {
          background: #fff;
          padding: 40px 30px;
          border-radius: 20px;
          box-shadow: 0 15px 30px rgba(0,0,0,0.1);
          width: 100%;
          max-width: 400px;
          text-align: center;
        }
        input {
          width: 100%;
          padding: 12px;
          margin-bottom: 15px;
          border-radius: 10px;
          border: 1px solid #ccc;
        }
        button {
          width: 100%;
          padding: 12px;
          border: none;
          border-radius: 10px;
          background: #00796b;
          color: white;
          cursor: pointer;
        }
        button:disabled { opacity: 0.6; cursor: not-allowed; }
        .signup-link span { color: #1e88e5; cursor: pointer; margin-left: 5px; }
        .signup-link span:hover { text-decoration: underline; }
      `}</style>
    </div>
  );
}