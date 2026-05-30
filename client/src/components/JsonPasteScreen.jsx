import { useState } from "react";
import { validateTestJson } from "../utils/validateTestJson";
import sampleQuiz from "../sample-data/sample-quiz.json";
import sampleMock from "../sample-data/sample-mock.json";

function JsonPasteScreen({ onStartTest, onOpenHistory }) {
  const [selectedMode, setSelectedMode] = useState("quiz");
  const [jsonText, setJsonText] = useState("");
  const [errors, setErrors] = useState([]);

  const isQuizMode = selectedMode === "quiz";

  function loadSample() {
    const sample = isQuizMode ? sampleQuiz : sampleMock;
    setJsonText(JSON.stringify(sample, null, 2));
    setErrors([]);
  }

  function handleModeChange(mode) {
    setSelectedMode(mode);
    setJsonText("");
    setErrors([]);
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

      setErrors([]);
      onStartTest(parsedData);
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
            <p className="muted">
              Local CBT-style practice app for SSC CGL.
            </p>
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

        <textarea
          value={jsonText}
          onChange={(e) => setJsonText(e.target.value)}
          placeholder={
            isQuizMode
              ? "Paste quiz JSON here..."
              : "Paste mock JSON here..."
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