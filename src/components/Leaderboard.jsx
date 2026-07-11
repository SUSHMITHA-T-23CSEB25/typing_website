import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";

// Local backend URL
import API_URL from "../api"; 

export default function Leaderboard() {
  const navigate = useNavigate();
  const [leaderboard, setLeaderboard] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLeaderboard = async () => {
      try {
        const res = await fetch(API_URL); // ✅ Local backend

        if (!res.ok) throw new Error("Failed to fetch users");

        const users = await res.json();

        // Flatten all users' scores
        const allScores = [];

        users.forEach(user => {
          if (user.scores && user.scores.length > 0) {
            user.scores.forEach(score => {
              allScores.push({
                name: user.name || "Unknown",
                wpm: score.wpm || 0,
                cpm: score.cpm || 0,
                accuracy: score.accuracy || 0,
                mistakes: score.mistakes || 0,
                time: score.time || 0,
                paragraphs: score.paragraphs || 1
              });
            });
          }
        });

        // Sort top 10 by WPM, then accuracy, then paragraphs
        const topScores = allScores
          .sort((a, b) => b.wpm - a.wpm || b.accuracy - a.accuracy || b.paragraphs - a.paragraphs)
          .slice(0, 10);

        setLeaderboard(topScores);

      } catch (err) {
        console.error("❌ Leaderboard error:", err);
        alert("Failed to load leaderboard");
      } finally {
        setLoading(false);
      }
    };

    fetchLeaderboard();
  }, []);

  // Rank colors for top 3
  const getRankColor = (rank) => {
    switch (rank) {
      case 0: return "#FFD700"; // Gold
      case 1: return "#C0C0C0"; // Silver
      case 2: return "#CD7F32"; // Bronze
      default: return "#000";    // Default black
    }
  };

  return (
    <div className="leaderboard-page">
      <h2>🏆 Leaderboard (Top 10)</h2>

      {loading ? (
        <p className="no-scores">Loading leaderboard...</p>
      ) : leaderboard.length === 0 ? (
        <p className="no-scores">No scores yet. Start practicing!</p>
      ) : (
        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>Rank</th>
                <th>User</th>
                <th>WPM</th>
                <th>CPM</th>
                <th>Accuracy (%)</th>
                <th>Mistakes</th>
                <th>Time</th>
                <th>Paragraphs</th>
              </tr>
            </thead>
            <tbody>
              {leaderboard.map((s, i) => (
                <tr
                  key={i}
                  className={i < 3 ? "top-rank" : i % 2 === 0 ? "even-row" : "odd-row"}
                  style={{ color: getRankColor(i) }}
                >
                  <td>{i + 1}</td>
                  <td>{s.name}</td>
                  <td>{s.wpm}</td>
                  <td>{s.cpm}</td>
                  <td>{s.accuracy}</td>
                  <td>{s.mistakes}</td>
                  <td>{s.time}s</td>
                  <td>{s.paragraphs}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <div className="button-container">
        <button onClick={() => navigate("/dashboard")}>⬅ Back</button>
      </div>

      <style>{`
        .leaderboard-page {
          padding: 30px;
          max-width: 900px;
          margin: 0 auto;
          font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
          background: linear-gradient(135deg, #f9f9f9, #e0f7fa);
          border-radius: 15px;
          box-shadow: 0 10px 25px rgba(0,0,0,0.1);
        }
        h2 {
          text-align: center;
          margin-bottom: 25px;
          color: #00796b;
        }
        .no-scores {
          text-align: center;
          font-style: italic;
          color: #757575;
        }
        .table-container {
          overflow-x: auto;
          margin-bottom: 25px;
        }
        table {
          width: 100%;
          border-collapse: collapse;
          font-size: 16px;
          border-radius: 12px;
          overflow: hidden;
        }
        th, td {
          padding: 12px 15px;
          text-align: center;
        }
        th {
          background-color: #00796b;
          color: white;
        }
        tr.even-row td {
          background-color: #f1fdfd;
        }
        tr.odd-row td {
          background-color: #ffffff;
        }
        tr.top-rank {
          font-weight: bold;
        }
        .button-container {
          text-align: center;
          margin-top: 20px;
        }
        button {
          padding: 12px 30px;
          font-size: 16px;
          border: none;
          border-radius: 8px;
          background: linear-gradient(90deg, #26a69a, #00796b);
          color: white;
          cursor: pointer;
          transition: 0.3s;
        }
        button:hover {
          background: linear-gradient(90deg, #00796b, #004d40);
        }
      `}</style>
    </div>
  );
}