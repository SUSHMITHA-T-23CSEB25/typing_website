import { useState } from "react";
import { useNavigate } from "react-router-dom";
import API_URL from "../api";

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

      // Handle login errors
      if (!res.ok) {
        alert(data.message || "Invalid credentials");
        return;
      }

      // Check whether backend returned a token
      if (!data.token) {
        console.error("Login response:", data);
        alert("Login failed: No authentication token received.");
        return;
      }

      // Save the REAL JWT token returned by the backend
      localStorage.setItem("token", data.token);

      // Save logged-in user information
      localStorage.setItem(
        "currentUser",
        JSON.stringify({
          name: data.name,
        })
      );

      // Verify saved data
      console.log("Token:", localStorage.getItem("token"));
      console.log(
        "Current User:",
        localStorage.getItem("currentUser")
      );

      alert("Login successful!");

      // Go to dashboard
      navigate("/dashboard", { replace: true });

    } catch (err) {
      console.error("Login error:", err);
      alert("Login failed. Please try again.");
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
          box-shadow: 0 15px 30px rgba(0, 0, 0, 0.1);
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
          box-sizing: border-box;
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

