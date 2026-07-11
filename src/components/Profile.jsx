import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";

// Local backend URL
const API_URL = "https://typing-websites.onrender.com";

export default function Profile() {
  const navigate = useNavigate();
  const [currentUser, setCurrentUser] = useState({ scores: [] });
  const [loading, setLoading] = useState(true);
  const [editingName, setEditingName] = useState(false);
  const [newName, setNewName] = useState("");

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const storedUser = JSON.parse(localStorage.getItem("currentUser"));

        if (!storedUser) {
          navigate("/login");
          return;
        }

        // Fetch latest user data from local backend
        const res = await fetch(`${API_URL}`);
        const users = await res.json();
        const user = users.find(u => u.id === storedUser.id || u._id === storedUser._id);

        if (!user) throw new Error("User not found");

        // Keep last 10 scores
        if (user.scores.length > 10) {
          user.scores = user.scores.slice(user.scores.length - 10);
        }

        setCurrentUser(user);
        setNewName(user.name || "");

        // Update localStorage
        localStorage.setItem("currentUser", JSON.stringify(user));

      } catch (err) {
        console.error(err);
        alert("Failed to load profile");
        navigate("/login");
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, [navigate]);

  // Update name in backend
  const saveName = async () => {
    try {
      const res = await fetch(`${API_URL}/${currentUser.id || currentUser._id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: newName || "Unknown" })
      });

      if (!res.ok) throw new Error("Update failed");

      const updatedUser = await res.json();

      setCurrentUser(updatedUser);
      setEditingName(false);

      // Update localStorage
      localStorage.setItem("currentUser", JSON.stringify(updatedUser));

    } catch (err) {
      console.error(err);
      alert("Failed to update name");
    }
  };

  const lastScores = [...currentUser.scores].slice(-5).reverse();

  const topScoreIndex = currentUser.scores.reduce(
    (maxIndex, score, i, arr) =>
      score.wpm > (arr[maxIndex]?.wpm || 0) ? i : maxIndex,
    0
  );

  if (loading)
    return (
      <p style={{ textAlign: "center", marginTop: "50px" }}>
        Loading profile...
      </p>
    );

  return (
    <div className="profile-page">
      <h2>👤 Profile</h2>

      <div className="profile-card">
        <p>
          <strong>Name:</strong>{" "}
          {editingName ? (
            <>
              <input
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                style={{ padding: "4px 8px", fontSize: "16px", borderRadius: "5px" }}
              />
              <button onClick={saveName} style={{ marginLeft: "8px" }}>
                Save
              </button>
              <button onClick={() => setEditingName(false)} style={{ marginLeft: "4px" }}>
                Cancel
              </button>
            </>
          ) : (
            <>
              {currentUser.name || "Unknown"}
              <button onClick={() => setEditingName(true)} style={{ marginLeft: "10px" }}>
                Edit
              </button>
            </>
          )}
        </p>

        <p>
          <strong>Email:</strong> {currentUser.email || "Unknown"}
        </p>
      </div>

      <h3>Last 5 Scores</h3>

      {lastScores.length === 0 ? (
        <p className="no-scores">No previous scores yet. Start typing!</p>
      ) : (
        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>#</th>
                <th>WPM</th>
                <th>CPM</th>
                <th>Accuracy (%)</th>
                <th>Mistakes</th>
                <th>Time</th>
                <th>Paragraphs</th>
              </tr>
            </thead>
            <tbody>
              {lastScores.map((s, i) => {
                const originalIndex = currentUser.scores.indexOf(s);
                return (
                  <tr key={i} className={originalIndex === topScoreIndex ? "top-score" : ""}>
                    <td>{i + 1}</td>
                    <td>{s.wpm ?? 0}</td>
                    <td>{s.cpm ?? 0}</td>
                    <td>{s.accuracy ?? 0}</td>
                    <td>{s.mistakes ?? 0}</td>
                    <td>{s.time ?? 0}s</td>
                    <td>{s.paragraphs ?? 1}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      <div className="button-container">
        <button onClick={() => navigate("/dashboard")}>⬅ Back</button>
      </div>

      {/* CSS remains unchanged */}
      <style>{`
        .profile-page {
          padding: 30px;
          max-width: 900px;
          margin: 0 auto;
          font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
          background: linear-gradient(135deg, #f9f9f9, #e0f7fa);
          border-radius: 15px;
          box-shadow: 0 10px 25px rgba(0,0,0,0.1);
        }
        h2 { text-align: center; margin-bottom: 25px; color: #00796b; text-shadow: 1px 1px 2px rgba(0,0,0,0.2); }
        .profile-card { background-color: #fff; padding: 20px; border-radius: 12px; box-shadow: 0 5px 15px rgba(0,0,0,0.1); margin-bottom: 25px; transition: transform 0.3s ease; }
        .profile-card:hover { transform: translateY(-5px); box-shadow: 0 10px 20px rgba(0,0,0,0.15); }
        h3 { color: #004d40; margin-bottom: 15px; border-bottom: 2px solid #004d40; padding-bottom: 5px; }
        .no-scores { text-align: center; color: #757575; font-style: italic; }
        .table-container { overflow-x: auto; }
        table { width: 100%; border-collapse: collapse; font-size: 16px; }
        th, td { padding: 12px 15px; border-radius: 8px; transition: background-color 0.3s ease, transform 0.2s ease; }
        th { background: #00796b; color: white; text-transform: uppercase; letter-spacing: 0.05em; }
        tr:nth-child(even) td { background-color: #f1fdfd; }
        tr:hover td { background-color: #b2dfdb; transform: scale(1.02); }
        .top-score { background-color: #c8e6c9 !important; font-weight: bold; color: #1b5e20; }
        .button-container { text-align: center; margin-top: 25px; }
        button { padding: 12px 30px; font-size: 16px; border: none; border-radius: 8px; background: linear-gradient(90deg, #26a69a, #00796b); color: white; cursor: pointer; transition: background 0.3s ease, transform 0.2s ease; }
        button:hover { background: linear-gradient(90deg, #00796b, #004d40); transform: translateY(-3px); }
      `}</style>
    </div>
  );
}