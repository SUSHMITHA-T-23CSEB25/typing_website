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

    if (loading) return;

    setLoading(true);

    try {
      const res = await fetch(`${API_URL}/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: email.trim().toLowerCase(),
          password,
        }),
      });

      const data = await res.json();

      console.log("LOGIN RESPONSE:", data);
      console.log("STATUS:", res.status);

      // ==============================
      // LOGIN FAILED
      // ==============================

      if (!res.ok) {
        alert(
          data.message ||
          data.error ||
          "Invalid email or password"
        );
        return;
      }

      // ==============================
      // CHECK TOKEN
      // ==============================

      if (!data.token) {
        console.error("Token missing:", data);

        alert("Login failed: No token received from server.");
        return;
      }

      // ==============================
      // GET USER
      // ==============================

      const user = data.user || {
        id: data.id,
        name: data.name,
        email: email.trim().toLowerCase(),
      };

      // ==============================
      // SAVE TOKEN
      // ==============================

      localStorage.setItem("token", data.token);

      // ==============================
      // SAVE USER
      // ==============================

      localStorage.setItem(
        "currentUser",
        JSON.stringify(user)
      );

      // ==============================
      // VERIFY
      // ==============================

      console.log("LOGIN SUCCESSFUL");
      console.log("Token:", localStorage.getItem("token"));
      console.log(
        "Current User:",
        localStorage.getItem("currentUser")
      );

      // ==============================
      // GO TO DASHBOARD
      // ==============================

      navigate("/dashboard", { replace: true });

    } catch (error) {
      console.error("LOGIN ERROR:", error);

      alert(
        "Unable to connect to the server. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">

      <form
        className="login-form"
        onSubmit={handleLogin}
      >

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

        <button
          type="submit"
          disabled={loading}
        >
          {loading ? "Logging in..." : "Login"}
        </button>

        <p className="signup-link">
          Don't have an account?

          <span
            onClick={() => navigate("/signup")}
          >
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
          background: linear-gradient(
            135deg,
            #e0f7fa,
            #f1f8e9
          );
          font-family: 'Segoe UI', sans-serif;
        }

        .login-form {
          background: white;
          padding: 40px 30px;
          border-radius: 20px;

          box-shadow:
            0 15px 30px rgba(0, 0, 0, 0.1);

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
          font-size: 15px;
        }

        input:focus {
          outline: none;
          border-color: #00796b;
        }

        button {
          width: 100%;
          padding: 12px;

          border: none;
          border-radius: 10px;

          background: #00796b;
          color: white;

          cursor: pointer;
          font-size: 16px;
        }

        button:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        .signup-link {
          margin-top: 20px;
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