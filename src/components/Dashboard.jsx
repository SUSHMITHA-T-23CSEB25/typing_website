import { useNavigate } from "react-router-dom";
import { useState, useEffect, useRef } from "react";
import API_URL from "../api";

// ==========================================
// Typing Paragraphs
// ==========================================

const paragraphs = [
  "The sun rises every morning, painting the sky with shades of orange and pink. Birds chirp happily, and the fresh air fills the lungs with energy. Nature reminds us to pause and enjoy simple moments.",

  "Technology shapes the way we live and communicate. From smartphones to the internet, it connects people across the globe. While it makes life easier, using it wisely is important.",

  "Learning is a lifelong journey. Every day brings new knowledge and opportunities to grow. Books, teachers, and experiences guide us toward understanding the world better.",

  "Accuracy is more important than speed at first.",

  "Friends bring joy and comfort in both happy and tough times. They listen, laugh, and support without judgment. True friendship is a treasure that lasts a lifetime.",
];

// ==========================================
// Dashboard
// ==========================================

export default function PracticeDashboard() {
  const navigate = useNavigate();

  // ==========================================
  // Current User
  // ==========================================

  const [currentUser, setCurrentUser] = useState(() => {
    try {
      const storedUser = localStorage.getItem("currentUser");

      if (!storedUser) {
        return {
          scores: [],
        };
      }

      const user = JSON.parse(storedUser);

      return {
        ...user,
        scores: user.scores || [],
      };
    } catch (error) {
      console.error("Error reading current user:", error);

      return {
        scores: [],
      };
    }
  });

  // ==========================================
  // Load Latest User Data
  // ==========================================

  useEffect(() => {
    const loadUser = async () => {
      try {
        const storedUser = localStorage.getItem("currentUser");

        if (!storedUser) {
          navigate("/login", { replace: true });
          return;
        }

        const user = JSON.parse(storedUser);

        const userId = user?._id || user?.id;

        if (!userId) {
          console.error("User ID not found:", user);
          return;
        }

        // Fetch latest user data from backend
        const res = await fetch(
          `${API_URL}/users?email=${encodeURIComponent(user.email)}`
        );

        if (!res.ok) {
          console.error("Failed to load user data");
          return;
        }

        const latestUser = await res.json();

        const updatedUser = {
          ...latestUser,
          id: latestUser._id || latestUser.id,
          scores: latestUser.scores || [],
        };

        setCurrentUser(updatedUser);

        localStorage.setItem(
          "currentUser",
          JSON.stringify(updatedUser)
        );

      } catch (error) {
        console.error("Failed to load current user:", error);
      }
    };

    loadUser();
  }, [navigate]);

  // ==========================================
  // Logout
  // ==========================================

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("currentUser");

    // Reload application and go to login
    window.location.href = "/login";
  };

  // ==========================================
  // Typing State
  // ==========================================

  const [input, setInput] = useState("");

  const [time, setTime] = useState(60);

  const [customTime, setCustomTime] = useState(60);

  const [isRunning, setIsRunning] = useState(false);

  const [wpm, setWpm] = useState(0);

  const [cpm, setCpm] = useState(0);

  const [accuracy, setAccuracy] = useState(100);

  const [mistakes, setMistakes] = useState(0);

  const [currentParaIndex, setCurrentParaIndex] = useState(0);

  const [paragraph, setParagraph] = useState(paragraphs[0]);

  const [finished, setFinished] = useState(false);

  // ==========================================
  // Overall Test Data
  // ==========================================

  const [paragraphsTyped, setParagraphsTyped] = useState(0);

  const [totalCharsTyped, setTotalCharsTyped] = useState(0);

  const [totalMistakes, setTotalMistakes] = useState(0);

  const [totalWordsTyped, setTotalWordsTyped] = useState(0);

  const inputRef = useRef(null);

  // ==========================================
  // Calculate Mistakes
  // ==========================================

  const calculateMistakes = (typed, para) => {
    let errors = 0;

    const minLen = Math.min(
      typed.length,
      para.length
    );

    for (let i = 0; i < minLen; i++) {
      if (typed[i] !== para[i]) {
        errors++;
      }
    }

    return (
      errors +
      Math.abs(typed.length - para.length)
    );
  };

  // ==========================================
  // Timer
  // ==========================================

  useEffect(() => {
    let timer;

    if (isRunning && time > 0) {
      timer = setTimeout(() => {
        setTime((previousTime) => previousTime - 1);
      }, 1000);
    }

    return () => clearTimeout(timer);
  }, [isRunning, time]);

  // ==========================================
  // Finish When Timer Reaches 0
  // ==========================================

  useEffect(() => {
    if (time === 0 && isRunning) {
      finishTest();
    }
  }, [time, isRunning]);

  // ==========================================
  // Update Typing Statistics
  // ==========================================

  useEffect(() => {
    if (!isRunning) {
      return;
    }

    const errors = calculateMistakes(
      input,
      paragraph
    );

    const elapsedSeconds =
      customTime - time;

    const elapsedMinutes =
      Math.max(elapsedSeconds, 1) / 60;

    const wordsTyped =
      input.trim().length > 0
        ? input.trim().split(/\s+/).length
        : 0;

    const totalWords =
      totalWordsTyped + wordsTyped;

    const totalCharacters =
      totalCharsTyped + input.length;

    const totalErrors =
      totalMistakes + errors;

    const calculatedWPM = Math.round(
      totalWords / elapsedMinutes
    );

    const calculatedCPM = Math.round(
      totalCharacters / elapsedMinutes
    );

    const calculatedAccuracy =
      totalCharacters > 0
        ? (
            ((totalCharacters - totalErrors) /
              totalCharacters) *
            100
          ).toFixed(2)
        : 100;

    setWpm(calculatedWPM);

    setCpm(calculatedCPM);

    setMistakes(totalErrors);

    setAccuracy(calculatedAccuracy);

  }, [
    input,
    time,
    totalCharsTyped,
    totalMistakes,
    totalWordsTyped,
    customTime,
    paragraph,
    isRunning,
  ]);

  // ==========================================
  // Start Test
  // ==========================================

  const startTest = () => {
    setParagraphsTyped(0);

    setTotalCharsTyped(0);

    setTotalMistakes(0);

    setTotalWordsTyped(0);

    setWpm(0);

    setCpm(0);

    setAccuracy(100);

    setMistakes(0);

    const randomIndex = Math.floor(
      Math.random() * paragraphs.length
    );

    setParagraph(
      paragraphs[randomIndex]
    );

    setCurrentParaIndex(randomIndex);

    setTime(customTime);

    setInput("");

    setFinished(false);

    setIsRunning(true);

    setTimeout(() => {
      inputRef.current?.focus();
    }, 100);
  };

  // ==========================================
  // Finish Test
  // ==========================================

  const finishTest = async () => {
    if (!isRunning) {
      return;
    }

    // Calculate final values directly
    const currentErrors = calculateMistakes(
      input,
      paragraph
    );

    const currentWords =
      input.trim().length > 0
        ? input.trim().split(/\s+/).length
        : 0;

    const finalWords =
      totalWordsTyped + currentWords;

    const finalCharacters =
      totalCharsTyped + input.length;

    const finalMistakes =
      totalMistakes + currentErrors;

    const elapsedSeconds =
      customTime - time;

    const elapsedMinutes =
      Math.max(elapsedSeconds, 1) / 60;

    const finalWPM = Math.round(
      finalWords / elapsedMinutes
    );

    const finalCPM = Math.round(
      finalCharacters / elapsedMinutes
    );

    const finalAccuracy =
      finalCharacters > 0
        ? (
            ((finalCharacters - finalMistakes) /
              finalCharacters) *
            100
          ).toFixed(2)
        : 100;

    // Update UI
    setWpm(finalWPM);

    setCpm(finalCPM);

    setMistakes(finalMistakes);

    setAccuracy(finalAccuracy);

    setIsRunning(false);

    setFinished(true);

    // Save score
    await saveScore({
      wpm: finalWPM,
      cpm: finalCPM,
      accuracy: Number(finalAccuracy),
      mistakes: finalMistakes,
      time: customTime,
      paragraphs:
        paragraphsTyped +
        (input.trim() ? 1 : 0),
    });
  };

  // ==========================================
  // Save Score
  // ==========================================

  const saveScore = async (scoreData) => {
    try {
      // Support both MongoDB _id and normal id
      const userId =
        currentUser?._id ||
        currentUser?.id;

      if (!userId) {
        console.error(
          "User ID not found:",
          currentUser
        );

        alert(
          "User information is missing. Please login again."
        );

        return;
      }

      console.log(
        "Saving score for user:",
        userId
      );

      console.log(
        "Score data:",
        scoreData
      );

      const res = await fetch(
        `${API_URL}/users/${userId}/scores`,
        {
          method: "POST",

          headers: {
            "Content-Type": "application/json",
          },

          body: JSON.stringify(scoreData),
        }
      );

      const data = await res.json();

      console.log(
        "Save score response:",
        data
      );

      if (!res.ok) {
        console.error(
          "Failed to save score:",
          data
        );

        alert(
          data.message ||
            data.error ||
            "Failed to save score"
        );

        return;
      }

      // Backend returns updated user
      const updatedUser = {
        ...data,

        id: data._id || data.id,

        scores: data.scores || [],
      };

      setCurrentUser(updatedUser);

      localStorage.setItem(
        "currentUser",
        JSON.stringify(updatedUser)
      );

      console.log(
        "✅ Score saved successfully"
      );

    } catch (error) {
      console.error(
        "❌ Failed to save score:",
        error
      );
    }
  };

  // ==========================================
  // Next Paragraph
  // ==========================================

  const nextParagraph = () => {
    if (!input.trim()) {
      return;
    }

    const errors = calculateMistakes(
      input,
      paragraph
    );

    const wordsTyped =
      input.trim().split(/\s+/).length;

    setTotalCharsTyped(
      (previous) =>
        previous + input.length
    );

    setTotalMistakes(
      (previous) =>
        previous + errors
    );

    setTotalWordsTyped(
      (previous) =>
        previous + wordsTyped
    );

    setParagraphsTyped(
      (previous) =>
        previous + 1
    );

    const nextIndex =
      (currentParaIndex + 1) %
      paragraphs.length;

    setCurrentParaIndex(nextIndex);

    setParagraph(
      paragraphs[nextIndex]
    );

    setInput("");

    setTimeout(() => {
      inputRef.current?.focus();
    }, 100);
  };

  // ==========================================
  // Render Paragraph
  // ==========================================

  const renderParagraph = () => {
    return paragraph
      .split("")
      .map((char, idx) => {
        let color = "";

        if (idx < input.length) {
          color =
            input[idx] === char
              ? "#2e7d32"
              : "#c62828";
        }

        return (
          <span
            key={idx}
            style={{ color }}
          >
            {char}
          </span>
        );
      });
  };

  // ==========================================
  // Best Score
  // ==========================================

  const bestScore =
    currentUser?.scores?.length > 0
      ? currentUser.scores.reduce(
          (max, score) =>
            score.wpm > max.wpm
              ? score
              : max,
          currentUser.scores[0]
        )
      : null;

  // ==========================================
  // Average WPM
  // ==========================================

  const averageWPM =
    currentUser?.scores?.length > 0
      ? Math.round(
          currentUser.scores.reduce(
            (sum, score) =>
              sum + Number(score.wpm || 0),
            0
          ) /
            currentUser.scores.length
        )
      : 0;

  // ==========================================
  // Average Accuracy
  // ==========================================

  const averageAccuracy =
    currentUser?.scores?.length > 0
      ? (
          currentUser.scores.reduce(
            (sum, score) =>
              sum +
              Number(score.accuracy || 0),
            0
          ) /
          currentUser.scores.length
        ).toFixed(2)
      : 0;

  // ==========================================
  // JSX
  // ==========================================

  return (
    <div className="practice-dashboard-page">

      {/* ======================================
          NAVBAR
      ====================================== */}

      <nav className="top-nav">

        <div
          className="logo"
          onClick={() =>
            navigate("/dashboard")
          }
        >
          🖋 TypingPro
        </div>

        <div className="nav-items">

          <span
            onClick={() =>
              navigate("/leaderboard")
            }
          >
            🏆 Leaderboard
          </span>

          <span
            onClick={() =>
              navigate("/profile")
            }
          >
            👤 Profile
          </span>

          <span
            onClick={handleLogout}
          >
            🚪 Logout
          </span>

        </div>

      </nav>

      {/* ======================================
          TITLE
      ====================================== */}

      <h1>
        🔥 Typing Practice Platform
      </h1>

      <h3>
        Welcome,{" "}
        {currentUser?.name || "User"}!
      </h3>

      {/* ======================================
          USER STATS
      ====================================== */}

      {currentUser?.scores?.length > 0 && (
        <div className="stats-card">

          <h4>
            🎯 Your Stats
          </h4>

          <p>
            <strong>
              Best WPM:
            </strong>{" "}
            {bestScore?.wpm || 0}
          </p>

          <p>
            <strong>
              Average WPM:
            </strong>{" "}
            {averageWPM}
          </p>

          <p>
            <strong>
              Average Accuracy:
            </strong>{" "}
            {averageAccuracy}%
          </p>

          <p>
            <strong>
              Total Tests:
            </strong>{" "}
            {currentUser.scores.length}
          </p>

        </div>
      )}

      {/* ======================================
          TYPING TEST
      ====================================== */}

      <div className="typing-test-container">

        <div className="timer-select">

          <label>
            Timer:
          </label>

          <select
            value={customTime}
            onChange={(e) =>
              setCustomTime(
                Number(e.target.value)
              )
            }
            disabled={isRunning}
          >

            <option value={30}>
              30s
            </option>

            <option value={60}>
              60s
            </option>

            <option value={120}>
              120s
            </option>

          </select>

        </div>

        {/* Paragraph */}

        <p className="paragraph">
          {renderParagraph()}
        </p>

        {/* Input */}

        <textarea
          ref={inputRef}
          rows="5"
          placeholder="Start typing..."
          value={input}
          onChange={(e) =>
            setInput(e.target.value)
          }
          disabled={!isRunning}
        />

        {/* Buttons */}

        <div className="buttons">

          <button
            onClick={startTest}
            disabled={isRunning}
          >
            Start
          </button>

          <button
            onClick={finishTest}
            disabled={!isRunning}
          >
            Finish
          </button>

          <button
            onClick={nextParagraph}
            disabled={!isRunning}
          >
            Next
          </button>

          <span className="time">
            Time: {time}s
          </span>

        </div>

        {/* Current Test Stats */}

        {(finished ||
          input.length > 0) && (

          <div className="stats">

            <p>
              WPM: {wpm}
            </p>

            <p>
              CPM: {cpm}
            </p>

            <p>
              Mistakes: {mistakes}
            </p>

            <p>
              Accuracy: {accuracy}%
            </p>

          </div>

        )}

      </div>

      {/* ======================================
          NAVIGATION BUTTONS
      ====================================== */}

      <div className="dashboard-buttons">

        <button
          onClick={() =>
            navigate("/leaderboard")
          }
        >
          Leaderboard
        </button>

        <button
          onClick={() =>
            navigate("/profile")
          }
        >
          Profile
        </button>

      </div>

      {/* ======================================
          CSS
      ====================================== */}

      <style>{`

        .practice-dashboard-page {
          max-width: 900px;
          margin: 30px auto;
          padding: 25px;
          font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
          background: linear-gradient(135deg, #e0f7fa, #f1f8e9);
          border-radius: 15px;
          box-shadow: 0 10px 25px rgba(0,0,0,0.1);
        }

        .top-nav {
          display: flex;
          justify-content: space-between;
          align-items: center;
          background-color: #004d40;
          padding: 15px 25px;
          border-radius: 12px;
          margin-bottom: 25px;
          box-shadow: 0 4px 8px rgba(0,0,0,0.1);
        }

        .logo {
          font-size: 20px;
          font-weight: bold;
          color: #fff;
          cursor: pointer;
          transition: 0.3s;
        }

        .logo:hover {
          color: #26a69a;
        }

        .nav-items {
          display: flex;
          gap: 20px;
        }

        .nav-items span {
          cursor: pointer;
          color: #fff;
          font-weight: bold;
          transition: 0.3s;
        }

        .nav-items span:hover {
          color: #26a69a;
          text-decoration: underline;
        }

        h1 {
          text-align: center;
          color: #00796b;
          margin-bottom: 10px;
        }

        h3 {
          text-align: center;
          color: #004d40;
          margin-bottom: 20px;
        }

        .stats-card {
          background-color: #ffffff;
          padding: 20px;
          border-radius: 12px;
          box-shadow: 0 4px 15px rgba(0,0,0,0.08);
          margin-bottom: 25px;
        }

        .stats-card h4 {
          margin-bottom: 12px;
          color: #00796b;
        }

        .stats-card p {
          margin: 6px 0;
          font-size: 16px;
        }

        .typing-test-container {
          margin-bottom: 25px;
        }

        .timer-select {
          text-align: center;
          margin-bottom: 15px;
        }

        select {
          padding: 6px 12px;
          border-radius: 6px;
          border: 1px solid #00796b;
          font-size: 16px;
          margin-left: 10px;
        }

        .paragraph {
          font-size: 18px;
          line-height: 1.6em;
          margin: 20px 0;
          padding: 15px;
          background-color: #ffffff;
          border-radius: 10px;
          box-shadow: inset 0 2px 4px rgba(0,0,0,0.05);
        }

        textarea {
          width: 100%;
          font-size: 16px;
          padding: 12px;
          border-radius: 10px;
          border: 1px solid #b2dfdb;
          box-shadow: inset 0 2px 4px rgba(0,0,0,0.05);
          resize: none;
          box-sizing: border-box;
        }

        .buttons {
          margin-top: 15px;
          display: flex;
          flex-wrap: wrap;
          align-items: center;
          gap: 10px;
        }

        .buttons button {
          padding: 10px 25px;
          border: none;
          border-radius: 8px;
          background: linear-gradient(90deg, #26a69a, #00796b);
          color: white;
          cursor: pointer;
          font-size: 16px;
          transition: 0.3s;
        }

        .buttons button:disabled {
          background: #b2dfdb;
          cursor: not-allowed;
        }

        .buttons button:hover:not(:disabled) {
          background: linear-gradient(90deg, #00796b, #004d40);
        }

        .time {
          font-size: 16px;
          margin-left: 20px;
          font-weight: bold;
          color: #004d40;
        }

        .stats {
          margin-top: 20px;
          padding: 15px;
          background-color: #ffffff;
          border-radius: 12px;
          box-shadow: 0 4px 10px rgba(0,0,0,0.08);
        }

        .stats p {
          margin: 5px 0;
          font-size: 16px;
        }

        .dashboard-buttons {
          display: flex;
          gap: 15px;
          flex-wrap: wrap;
          justify-content: center;
          margin-top: 20px;
        }

        .dashboard-buttons button {
          padding: 12px 25px;
          font-size: 16px;
          border: none;
          border-radius: 8px;
          cursor: pointer;
          transition: 0.3s;
          background: linear-gradient(90deg, #26a69a, #00796b);
          color: white;
        }

        .dashboard-buttons button:hover {
          background: linear-gradient(90deg, #00796b, #004d40);
        }

        @media (max-width: 600px) {

          .practice-dashboard-page {
            margin: 10px;
            padding: 15px;
          }

          .top-nav {
            flex-direction: column;
            gap: 15px;
          }

          .nav-items {
            flex-wrap: wrap;
            justify-content: center;
            gap: 12px;
          }

          .paragraph {
            font-size: 16px;
          }

          .buttons {
            justify-content: center;
          }

        }

      `}</style>

    </div>
  );
}