import { useState } from "react";
import { useNavigate } from "react-router-dom";
import API_URL from "../api"; // common backend URL

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch(`${API_URL}/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email,
          password,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        alert(data.message || "Invalid credentials");
        return;
      }

      // Save user data
     localStorage.setItem("token", "dummy-token");
localStorage.setItem("currentUser", JSON.stringify(data));

alert("Login successful!");

// Force the app to reload so App.jsx reads the new token
window.location.href = "/dashboard";
    } catch (err) {
      console.error("Login error:", err);
      alert("Login failed. Try again.");
    } finally {
      setLoading(false);
    }
  };


  return (
    <div className="login-page">

      <form className="login-form" onSubmit={handleLogin}>

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
          <span onClick={() => navigate("/signup")}>
            Signup
          </span>
        </p>

      </form>


      <style>{`
        .login-page {
          display: flex;
          justify-content: center;
          align-items: center;
          min-height: 100vh;
          background: linear-gradient(135deg, #e0f7fa, #f1f8e9);
          font-family: 'Segoe UI', sans-serif;
        }

        .login-form {
          background: white;
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

        button:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        .signup-link span {
          color: #1e88e5;
          cursor: pointer;
          margin-left: 5px;
        }

        .signup-link span:hover {
          text-decoration: underline;
        }
      `}</style>

    </div>
  );
}