import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";

import Login from "./components/Login";
import Signup from "./components/Signup";
import Dashboard from "./components/Dashboard";
import Leaderboard from "./components/Leaderboard";
import Profile from "./components/Profile";

// ==========================================
// Protected Route
// ==========================================

function ProtectedRoute({ children }) {
  const token = localStorage.getItem("token");

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  return children;
}

// ==========================================
// App
// ==========================================

function App() {
  return (
    <Router>
      <Routes>

        {/* ================= HOME ================= */}

        <Route
          path="/"
          element={
            localStorage.getItem("token") ? (
              <Navigate to="/dashboard" replace />
            ) : (
              <Navigate to="/login" replace />
            )
          }
        />

        {/* ================= LOGIN ================= */}

        <Route
          path="/login"
          element={<Login />}
        />

        {/* ================= SIGNUP ================= */}

        <Route
          path="/signup"
          element={<Signup />}
        />

        {/* ================= DASHBOARD ================= */}

        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />

        {/* ================= LEADERBOARD ================= */}

        <Route
          path="/leaderboard"
          element={
            <ProtectedRoute>
              <Leaderboard />
            </ProtectedRoute>
          }
        />

        {/* ================= PROFILE ================= */}

        <Route
          path="/profile"
          element={
            <ProtectedRoute>
              <Profile />
            </ProtectedRoute>
          }
        />

        {/* ================= INDEX ================= */}

        <Route
          path="/index.html"
          element={<Navigate to="/" replace />}
        />

        {/* ================= UNKNOWN URL ================= */}

        <Route
          path="*"
          element={<Navigate to="/" replace />}
        />

      </Routes>
    </Router>
  );
}

export default App;