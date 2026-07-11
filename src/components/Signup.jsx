import { useState } from "react";
import { useNavigate } from "react-router-dom";

// Use your local backend
import API_URL from "../api"; 

export default function Signup() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSignup = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Check if email already exists in your backend
      const checkRes = await fetch(`${API_URL}?email=${email}`);
      const existingUsers = await checkRes.json();

      if (existingUsers.length > 0) {
        alert("Email already exists");
        setLoading(false);
        return;
      }

      // Create new user in your backend
      const res = await fetch(API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password, scores: [] }),
      });

      const user = await res.json();

      localStorage.setItem("currentUser", JSON.stringify(user));

      alert("Signup successful! Redirecting to dashboard...");
      navigate("/dashboard");
    } catch (err) {
      console.error("Signup error:", err);
      alert("Signup failed. Try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="signup-page">
      <form onSubmit={handleSignup} className="signup-form">
        <h2>🖊 Signup</h2>
        <input
          type="text"
          placeholder="Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />
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
          {loading ? "Signing up..." : "Signup"}
        </button>
        <p className="login-link">
          Already have an account?
          <span onClick={() => navigate("/login")}> Login</span>
        </p>
      </form>

      <style>{`
        .signup-page { display: flex; justify-content: center; align-items: center; min-height: 100vh; background: linear-gradient(135deg, #e0f7fa, #f1f8e9); font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; }
        .signup-form { background: #fff; padding: 40px 30px; border-radius: 20px; box-shadow: 0 15px 30px rgba(0,0,0,0.1); width: 100%; max-width: 400px; text-align: center; transition: 0.3s; }
        .signup-form:hover { transform: translateY(-3px); box-shadow: 0 20px 35px rgba(0,0,0,0.15); }
        .signup-form h2 { margin-bottom: 25px; color: #00796b; }
        .signup-form input { width: 100%; padding: 12px 15px; margin-bottom: 15px; border: 1px solid #b2dfdb; border-radius: 10px; font-size: 16px; box-shadow: inset 0 2px 4px rgba(0,0,0,0.05); transition: 0.2s; }
        .signup-form input:focus { border-color: #004d40; outline: none; box-shadow: 0 0 5px rgba(0,121,107,0.5); }
        .signup-form button { width: 100%; padding: 12px; border: none; border-radius: 10px; background: linear-gradient(90deg, #26a69a, #00796b); color: white; font-size: 16px; cursor: pointer; transition: 0.3s; }
        .signup-form button:disabled { opacity: 0.6; cursor: not-allowed; }
        .signup-form button:hover:enabled { background: linear-gradient(90deg, #00796b, #004d40); }
        .signup-form .login-link { margin-top: 15px; font-size: 14px; color: #004d40; }
        .signup-form .login-link span { color: #1e88e5; cursor: pointer; margin-left: 5px; }
        .signup-form .login-link span:hover { text-decoration: underline; }
      `}</style>
    </div>
  );
}