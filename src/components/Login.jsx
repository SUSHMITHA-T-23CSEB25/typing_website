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
          email: email.trim(),
          password,
        }),
      });

      // Get backend response
      const data = await res.json();

      // IMPORTANT: Show the complete backend response
      console.log(
        "LOGIN RESPONSE:",
        JSON.stringify(data, null, 2)
      );

      console.log("Response status:", res.status);
      console.log("Response OK:", res.ok);

      // Handle backend errors
       if (!res.ok) {
  console.error("LOGIN FAILED:", data);

  const errorMessage =
    data.message ||
    data.error ||
    (typeof data === "string" ? data : JSON.stringify(data));

  alert(`Login failed: ${errorMessage}`);
  return;
}

      // Make sure backend sent a JWT token
      if (!data.token) {
        console.error(
          "TOKEN MISSING. Backend returned:",
          JSON.stringify(data, null, 2)
        );

        alert(
          "Login failed: No authentication token received from server."
        );

        return;
      }

      // Save the REAL JWT token
      localStorage.setItem("token", data.token);

      // Save user information
      localStorage.setItem(
        "currentUser",
        JSON.stringify({
          name: data.name,
        })
      );

      // Verify that token was saved
      console.log(
        "TOKEN SAVED:",
        localStorage.getItem("token")
      );

      console.log(
        "CURRENT USER:",
        localStorage.getItem("currentUser")
      );

      alert("Login successful!");

      // Navigate to dashboard
      navigate("/dashboard", { replace: true });

    } catch (err) {
      console.error("LOGIN ERROR:", err);

      alert(
        "Unable to connect to the server. Please try again."
      );
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

