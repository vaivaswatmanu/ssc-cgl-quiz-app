
import { useState } from "react";
import JsonPasteScreen from "./components/JsonPasteScreen";
import TestScreen from "./components/TestScreen";
import ResultDashboard from "./components/ResultDashboard";
import ReviewScreen from "./components/ReviewScreen";
import SavedAttempts from "./components/SavedAttempts";
import { calculateResult } from "./utils/scoring";
import { saveAttemptToBackend } from "./utils/api";
import "./styles.css";

function App() {
  const [screen, setScreen] = useState("paste");
  const [testData, setTestData] = useState(null);
  const [submission, setSubmission] = useState(null);
  const [summary, setSummary] = useState(null);
  const [saveStatus, setSaveStatus] = useState("idle");
  const [savedFolderName, setSavedFolderName] = useState("");
  const [historyMode, setHistoryMode] = useState("quiz");

  function handleStartTest(data) {
    setTestData(data);
    setSubmission(null);
    setSummary(null);
    setSaveStatus("idle");
    setSavedFolderName("");
    setScreen("test");
  }

  function handleBackToPaste() {
    setTestData(null);
    setSubmission(null);
    setSummary(null);
    setSaveStatus("idle");
    setSavedFolderName("");
    setScreen("paste");
  }
  function handleOpenHistory(mode) {
  setHistoryMode(mode);
  setScreen("history");
}

function handleOpenSavedAttempt({ testData, submission, summary }) {
  setTestData(testData);
  setSubmission(submission);
  setSummary(summary);
  setSaveStatus("saved");
  setSavedFolderName("Loaded from history");
  setScreen("result");
}

  async function handleSubmitTest(submissionData) {
    const finalSubmission = {
  testId: testData.testId,
  testName: testData.testName,
  mode: testData.mode,
  submittedAt: submissionData.submittedAt,
  totalTimeSeconds: submissionData.totalTimeSeconds,
  timerType: submissionData.timerType,
  autoSubmitted: submissionData.autoSubmitted,
  pauseCount: submissionData.pauseCount || 0,
  totalPausedSeconds: submissionData.totalPausedSeconds || 0,
  responses: submissionData.responses,
};

    const finalSummary = calculateResult(testData, submissionData.responses);

    setSubmission(finalSubmission);
    setSummary(finalSummary);
    setScreen("result");

    try {
      setSaveStatus("saving");

      const saveResponse = await saveAttemptToBackend({
        questions: testData,
        submission: finalSubmission,
        summary: finalSummary,
      });

      setSavedFolderName(saveResponse.data.folderName);
      setSaveStatus("saved");
    } catch (error) {
      console.error("Save failed:", error);
      setSaveStatus("failed");
    }
  }

  if (screen === "paste") {
  return (
    <JsonPasteScreen
      onStartTest={handleStartTest}
      onOpenHistory={handleOpenHistory}
    />
  );
}

  if (screen === "test" && testData) {
    return (
      <TestScreen
        testData={testData}
        onBack={handleBackToPaste}
        onSubmitTest={handleSubmitTest}
      />
    );
  }

  if (screen === "result" && testData && submission && summary) {
    return (
      <ResultDashboard
  testData={testData}
  submission={submission}
  summary={summary}
  saveStatus={saveStatus}
  savedFolderName={savedFolderName}
  onBackToHome={handleBackToPaste}
  onReviewAnswers={() => setScreen("review")}
/>
    );
  }
  if (screen === "review" && testData && submission && summary) {
  return (
    <ReviewScreen
      testData={testData}
      submission={submission}
      summary={summary}
      onBackToResult={() => setScreen("result")}
      onBackToHome={handleBackToPaste}
    />
  );
}
if (screen === "history") {
  return (
    <SavedAttempts
      mode={historyMode}
      onBackToHome={handleBackToPaste}
      onOpenAttempt={handleOpenSavedAttempt}
    />
  );
}

  return null;
}

export default App;