function ResultDashboard({
  testData,
  submission,
  summary,
  saveStatus,
  savedFolderName,
  onBackToHome,
  onReviewAnswers,
}) {
  return (
    <div className="page">
      <div className="card wide-card">
        <div className="header-row">
          <div>
            <h1>Result Dashboard</h1>
            <p className="muted">{summary.testName}</p>
          </div>
          <div className="badge">{summary.mode.toUpperCase()}</div>
        </div>

        <div className="result-score-box">
          <span>Final Score</span>
          <strong>{summary.score}</strong>
        </div>

        <div className="info-grid result-metric-grid">
  <div className="metric-card total">
    <span>Total Questions</span>
    <strong>{summary.totalQuestions}</strong>
  </div>

  <div className="metric-card attempted">
    <span>Attempted</span>
    <strong>{summary.attempted}</strong>
  </div>

  <div className="metric-card correct">
    <span>Correct</span>
    <strong>{summary.correct}</strong>
  </div>

  <div className="metric-card wrong">
    <span>Wrong</span>
    <strong>{summary.wrong}</strong>
  </div>

  <div className="metric-card unattempted">
    <span>Unattempted</span>
    <strong>{summary.unattempted}</strong>
  </div>

  <div className="metric-card accuracy">
    <span>Accuracy</span>
    <strong>{summary.accuracy}%</strong>
  </div>
</div>

        <div className="save-status-box">
          <strong>Save Status:</strong>{" "}
          {saveStatus === "saving" && "Saving attempt..."}
          {saveStatus === "saved" && `Saved successfully: ${savedFolderName}`}
          {saveStatus === "failed" && "Failed to save attempt."}
        </div>
{submission.timerMode === "sectional" &&
  submission.sectionTimings &&
  Object.keys(submission.sectionTimings).length > 0 && (
    <>
      <h2>Section Timing</h2>

      <div className="table-wrapper">
        <table>
          <thead>
            <tr>
              <th>Section</th>
              <th>Time Limit</th>
              <th>Time Taken</th>
              <th>Auto Submitted</th>
              <th>Submitted At</th>
            </tr>
          </thead>
          <tbody>
            {Object.values(submission.sectionTimings).map((section) => (
              <tr key={section.sectionId}>
                <td>{section.sectionName}</td>
                <td>{section.timeLimitSeconds} sec</td>
                <td>{section.timeTakenSeconds} sec</td>
                <td>{section.autoSubmitted ? "Yes" : "No"}</td>
                <td>{new Date(section.submittedAt).toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  )}
        <h2>Section-wise Result</h2>

        <div className="table-wrapper">
          <table>
            <thead>
              <tr>
                <th>Section</th>
                <th>Total</th>
                <th>Attempted</th>
                <th>Correct</th>
                <th>Wrong</th>
                <th>Unattempted</th>
                <th>Score</th>
                <th>Accuracy</th>
              </tr>
            </thead>
            <tbody>
              {summary.sectionResults.map((section) => (
                <tr key={section.sectionId}>
                  <td>{section.sectionName}</td>
                  <td>{section.totalQuestions}</td>
                  <td>{section.attempted}</td>
                  <td>{section.correct}</td>
                  <td>{section.wrong}</td>
                  <td>{section.unattempted}</td>
                  <td>{section.score}</td>
                  <td>{section.accuracy}%</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <h2>Submission Details</h2>

        <div className="section-item">
          <span>Submitted At</span>
          <strong>{new Date(submission.submittedAt).toLocaleString()}</strong>
        </div>
        <div className="section-item">
  <span>Total Time</span>
  <strong>{submission.totalTimeSeconds || 0} seconds</strong>
</div>

<div className="section-item">
  <span>Timer Type</span>
  <strong>{submission.timerType}</strong>
</div>

<div className="section-item">
  <span>Auto Submitted</span>
  <strong>{submission.autoSubmitted ? "Yes" : "No"}</strong>
</div>
<div className="section-item">
  <span>Pause Count</span>
  <strong>{submission.pauseCount || 0}</strong>
</div>

<div className="section-item">
  <span>Total Paused Time</span>
  <strong>{submission.totalPausedSeconds || 0} seconds</strong>
</div>

        <div className="section-item">
          <span>Test ID</span>
          <strong>{testData.testId}</strong>
        </div>

        <div className="button-row">
          <button onClick={onBackToHome}>Back to Home</button>
          <button className="primary" onClick={onReviewAnswers}>
            Review Answers
            </button>
        </div>
      </div>
    </div>
  );
}

export default ResultDashboard;