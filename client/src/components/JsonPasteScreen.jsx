import { useState } from "react";
import { validateTestJson } from "../utils/validateTestJson";
import sampleQuiz from "../sample-data/sample-quiz.json";
import sampleMock from "../sample-data/sample-mock.json";

function JsonPasteScreen({ onStartTest, onOpenHistory }) {
  const [selectedMode, setSelectedMode] = useState("quiz");
  const [jsonText, setJsonText] = useState("");
  const [errors, setErrors] = useState([]);

  const [timerOverrideType, setTimerOverrideType] = useState("json");
  const [timerDurationMinutes, setTimerDurationMinutes] = useState(10);

  const isQuizMode = selectedMode === "quiz";

  function loadSample() {
    const sample = isQuizMode ? sampleQuiz : sampleMock;
    setJsonText(JSON.stringify(sample, null, 2));
    setErrors([]);

    if (sample.timer?.durationMinutes) {
      setTimerDurationMinutes(sample.timer.durationMinutes);
    }
  }

  function handleModeChange(mode) {
    setSelectedMode(mode);
    setJsonText("");
    setErrors([]);
    setTimerOverrideType("json");
    setTimerDurationMinutes(mode === "quiz" ? 10 : 60);
  }

  function applyTimerOverride(testData) {
    if (timerOverrideType === "json") {
      return testData;
    }

    const updatedTestData = {
      ...testData,
      timer: {
        type: timerOverrideType,
        durationMinutes:
          timerOverrideType === "none" ? 0 : Number(timerDurationMinutes),
      },
    };

    return updatedTestData;
  }

  function validateTimerOverride() {
    if (timerOverrideType === "json") return [];

    if (timerOverrideType === "none") return [];

    const duration = Number(timerDurationMinutes);

    if (!duration || duration <= 0) {
      return ["Timer duration must be greater than 0."];
    }

    return [];
  }

  function handleStart() {
    try {
      const parsedData = JSON.parse(jsonText);
      const validationErrors = validateTestJson(parsedData);

      if (validationErrors.length > 0) {
        setErrors(validationErrors);
        return;
      }

      if (parsedData.mode !== selectedMode) {
        setErrors([
          `You are in ${selectedMode.toUpperCase()} mode, but pasted JSON is ${parsedData.mode.toUpperCase()} mode.`,
          `Switch to ${parsedData.mode.toUpperCase()} tab or paste correct ${selectedMode.toUpperCase()} JSON.`,
        ]);
        return;
      }

      const timerErrors = validateTimerOverride();

      if (timerErrors.length > 0) {
        setErrors(timerErrors);
        return;
      }

      const finalTestData = applyTimerOverride(parsedData);

      setErrors([]);
      onStartTest(finalTestData);
    } catch (error) {
      setErrors(["Invalid JSON format. Please check commas/brackets."]);
    }
  }

  return (
    <div className="page">
      <div className="card wide-card">
        <div className="header-row">
          <div>
            <h1>SSC Quiz App</h1>
            <p className="muted">Local CBT-style practice app for SSC CGL.</p>
          </div>
          <div className="badge">Local App</div>
        </div>

        <div className="mode-tabs">
          <button
            className={selectedMode === "quiz" ? "active" : ""}
            onClick={() => handleModeChange("quiz")}
          >
            Quiz Practice
          </button>

          <button
            className={selectedMode === "mock" ? "active" : ""}
            onClick={() => handleModeChange("mock")}
          >
            Mock Tests
          </button>
        </div>

        <div className="mode-panel">
          <div>
            <h2>{isQuizMode ? "Quiz Practice" : "Mock Test"}</h2>
            <p className="muted">
              {isQuizMode
                ? "Use this for topic-wise quizzes, sectional practice, and short drills."
                : "Use this for full/mini mocks with multiple sections."}
            </p>
          </div>

          <div className="button-row">
            <button onClick={loadSample}>
              {isQuizMode ? "Load Sample Quiz" : "Load Sample Mock"}
            </button>

            <button onClick={() => onOpenHistory(selectedMode)}>
              {isQuizMode ? "Quiz History" : "Mock History"}
            </button>

            <button className="primary" onClick={handleStart}>
              {isQuizMode ? "Start Quiz" : "Start Mock"}
            </button>
          </div>
        </div>

        <div className="timer-config-box">
          <div>
            <label>Timer Mode</label>
            <select
              value={timerOverrideType}
              onChange={(e) => setTimerOverrideType(e.target.value)}
            >
              <option value="json">Use JSON timer</option>
              <option value="none">No timer</option>
              <option value="practice">Practice timer</option>
              <option value="strict">Strict timer</option>
            </select>
          </div>

          {timerOverrideType !== "json" && timerOverrideType !== "none" && (
            <div>
              <label>Duration Minutes</label>
              <input
                type="number"
                min="0.1"
                step="0.1"
                value={timerDurationMinutes}
                onChange={(e) => setTimerDurationMinutes(e.target.value)}
              />
            </div>
          )}

          <div className="timer-help">
            {timerOverrideType === "json" &&
              "Uses the timer settings already present inside pasted JSON."}
            {timerOverrideType === "none" && "No timer will be shown during test."}
            {timerOverrideType === "practice" &&
              "Timer counts up. Good for practice and speed tracking."}
            {timerOverrideType === "strict" &&
              "Timer counts down and auto-submits when time ends."}
          </div>
        </div>

        <textarea
          value={jsonText}
          onChange={(e) => setJsonText(e.target.value)}
          placeholder={
            isQuizMode ? "Paste quiz JSON here..." : "Paste mock JSON here..."
          }
        />

        {errors.length > 0 && (
          <div className="error-box">
            <h3>Fix these issues:</h3>
            <ul>
              {errors.map((error, index) => (
                <li key={index}>{error}</li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}

export default JsonPasteScreen;