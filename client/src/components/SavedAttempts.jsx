import { useEffect, useMemo, useState } from "react";
import {
  deleteAttemptByFolder,
  getAttemptByFolder,
  getAttemptsByMode,
} from "../utils/api";

function getLocalDateString() {
  const now = new Date();
  const pad = (num) => String(num).padStart(2, "0");

  return [
    now.getFullYear(),
    pad(now.getMonth() + 1),
    pad(now.getDate()),
  ].join("-");
}

function getDateFromFolder(folderName) {
  const [datePart] = folderName.split("__");
  return datePart || "";
}

function formatFolderDate(folderName) {
  const [datePart, timePart] = folderName.split("__");

  if (!datePart || !timePart) return folderName;

  return `${datePart} ${timePart.replaceAll("-", ":")}`;
}

function getAverage(values) {
  const validValues = values.filter((value) => typeof value === "number");

  if (validValues.length === 0) return 0;

  const total = validValues.reduce((sum, value) => sum + value, 0);
  return Number((total / validValues.length).toFixed(2));
}

function downloadJson(fileName, data) {
  const jsonString = JSON.stringify(data, null, 2);
  const blob = new Blob([jsonString], { type: "application/json" });
  const url = URL.createObjectURL(blob);

  const link = document.createElement("a");
  link.href = url;
  link.download = fileName;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);

  URL.revokeObjectURL(url);
}

function SavedAttempts({ mode, onBackToHome, onOpenAttempt }) {
  const [attempts, setAttempts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [openingFolder, setOpeningFolder] = useState("");
  const [exporting, setExporting] = useState(false);
  const [deletingFolder, setDeletingFolder] = useState("");
  const [error, setError] = useState("");

  const [dateFilterType, setDateFilterType] = useState("all");
  const [selectedDate, setSelectedDate] = useState("");
  const [rangeStartDate, setRangeStartDate] = useState("");
  const [rangeEndDate, setRangeEndDate] = useState("");

  const title = mode === "mock" ? "Mock History" : "Quiz History";
  const todayString = getLocalDateString();

  useEffect(() => {
    loadAttempts();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mode]);

  const filteredAttempts = useMemo(() => {
    if (dateFilterType === "all") return attempts;

    if (dateFilterType === "today") {
      return attempts.filter(
        (attempt) => getDateFromFolder(attempt.folderName) === todayString
      );
    }

    if (dateFilterType === "custom" && selectedDate) {
      return attempts.filter(
        (attempt) => getDateFromFolder(attempt.folderName) === selectedDate
      );
    }

    if (dateFilterType === "range" && rangeStartDate && rangeEndDate) {
      return attempts.filter((attempt) => {
        const attemptDate = getDateFromFolder(attempt.folderName);
        return attemptDate >= rangeStartDate && attemptDate <= rangeEndDate;
      });
    }

    return attempts;
  }, [
    attempts,
    dateFilterType,
    selectedDate,
    rangeStartDate,
    rangeEndDate,
    todayString,
  ]);

  const analytics = useMemo(() => {
    const scores = filteredAttempts.map((attempt) => attempt.summary?.score);
    const accuracies = filteredAttempts.map(
      (attempt) => attempt.summary?.accuracy
    );

    const validScores = scores.filter((score) => typeof score === "number");

    return {
      attemptsCount: filteredAttempts.length,
      averageScore: getAverage(scores),
      bestScore: validScores.length === 0 ? 0 : Math.max(...validScores),
      averageAccuracy: getAverage(accuracies),
    };
  }, [filteredAttempts]);

  async function loadAttempts() {
    try {
      setLoading(true);
      setError("");

      const data = await getAttemptsByMode(mode);
      setAttempts(data);
    } catch (err) {
      setError(err.message || "Failed to load attempts.");
    } finally {
      setLoading(false);
    }
  }

  async function handleOpenAttempt(folderName) {
    try {
      setOpeningFolder(folderName);
      setError("");

      const attempt = await getAttemptByFolder(mode, folderName);

      onOpenAttempt({
        testData: attempt.questions,
        submission: attempt.submission,
        summary: attempt.summary,
      });
    } catch (err) {
      setError(err.message || "Failed to open attempt.");
    } finally {
      setOpeningFolder("");
    }
  }

  async function handleExportSingleAttempt(folderName) {
    try {
      setOpeningFolder(folderName);
      setError("");

      const attempt = await getAttemptByFolder(mode, folderName);

      downloadJson(`${mode}-attempt-${folderName}.json`, {
        exportedAt: new Date().toISOString(),
        mode,
        folderName,
        questions: attempt.questions,
        submission: attempt.submission,
        summary: attempt.summary,
      });
    } catch (err) {
      setError(err.message || "Failed to export attempt.");
    } finally {
      setOpeningFolder("");
    }
  }

  async function handleExportFilteredAttempts() {
    try {
      setExporting(true);
      setError("");

      const fullAttempts = [];

      for (const attempt of filteredAttempts) {
        const fullAttempt = await getAttemptByFolder(mode, attempt.folderName);

        fullAttempts.push({
          folderName: attempt.folderName,
          questions: fullAttempt.questions,
          submission: fullAttempt.submission,
          summary: fullAttempt.summary,
        });
      }

      downloadJson(`${mode}-filtered-attempts-export-${getLocalDateString()}.json`, {
        exportedAt: new Date().toISOString(),
        mode,
        filter: {
          type: dateFilterType,
          selectedDate,
          rangeStartDate,
          rangeEndDate,
          today: todayString,
        },
        analytics,
        attemptsCount: fullAttempts.length,
        attempts: fullAttempts,
      });
    } catch (err) {
      setError(err.message || "Failed to export filtered attempts.");
    } finally {
      setExporting(false);
    }
  }

  async function handleDeleteAttempt(folderName) {
    const confirmDelete = window.confirm(
      "Delete this attempt permanently from local history?"
    );

    if (!confirmDelete) return;

    try {
      setDeletingFolder(folderName);
      setError("");

      await deleteAttemptByFolder(mode, folderName);
      await loadAttempts();
    } catch (err) {
      setError(err.message || "Failed to delete attempt.");
    } finally {
      setDeletingFolder("");
    }
  }

  return (
    <div className="page">
      <div className="card wide-card">
        <div className="header-row">
          <div>
            <h1>{title}</h1>
            <p className="muted">
              Saved {mode === "mock" ? "mock test" : "quiz"} attempts from local
              storage.
            </p>
          </div>
          <div className="badge">{mode.toUpperCase()}</div>
        </div>

        <div className="button-row">
          <button onClick={onBackToHome}>Back to Home</button>
          <button onClick={loadAttempts}>Refresh</button>
          <button
            className="primary"
            onClick={handleExportFilteredAttempts}
            disabled={filteredAttempts.length === 0 || exporting}
          >
            {exporting ? "Exporting..." : "Export Filtered Data"}
          </button>
        </div>

        <div className="history-filter-box">
          <div>
            <label>Filter</label>
            <select
              value={dateFilterType}
              onChange={(e) => setDateFilterType(e.target.value)}
            >
              <option value="all">All attempts</option>
              <option value="today">Today</option>
              <option value="custom">Specific date</option>
              <option value="range">Date range</option>
            </select>
          </div>

          {dateFilterType === "custom" && (
            <div>
              <label>Select date</label>
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
              />
            </div>
          )}

          {dateFilterType === "range" && (
            <>
              <div>
                <label>Start date</label>
                <input
                  type="date"
                  value={rangeStartDate}
                  onChange={(e) => setRangeStartDate(e.target.value)}
                />
              </div>

              <div>
                <label>End date</label>
                <input
                  type="date"
                  value={rangeEndDate}
                  onChange={(e) => setRangeEndDate(e.target.value)}
                />
              </div>
            </>
          )}
        </div>

        <div className="analytics-grid">
          <div className="analytics-card">
            <span>Attempts</span>
            <strong>{analytics.attemptsCount}</strong>
          </div>

          <div className="analytics-card">
            <span>Average Score</span>
            <strong>{analytics.averageScore}</strong>
          </div>

          <div className="analytics-card">
            <span>Best Score</span>
            <strong>{analytics.bestScore}</strong>
          </div>

          <div className="analytics-card">
            <span>Average Accuracy</span>
            <strong>{analytics.averageAccuracy}%</strong>
          </div>
        </div>

        {error && (
          <div className="error-box">
            <h3>Error</h3>
            <p>{error}</p>
          </div>
        )}

        {loading && <p className="muted">Loading attempts...</p>}

        {!loading && filteredAttempts.length === 0 && (
          <div className="empty-state">
            <h2>No attempts found</h2>
            <p>
              No {mode === "mock" ? "mock test" : "quiz"} attempts match this
              filter.
            </p>
          </div>
        )}

        {!loading && filteredAttempts.length > 0 && (
          <div className="attempt-list">
            {filteredAttempts.map((attempt) => {
              const summary = attempt.summary || {};

              return (
                <div className="attempt-card" key={attempt.folderName}>
                  <div>
                    <h2>{summary.testName || "Untitled Test"}</h2>
                    <p className="muted">{formatFolderDate(attempt.folderName)}</p>

                    <div className="attempt-stats">
                      <span>Score: {summary.score ?? "-"}</span>
                      <span>Accuracy: {summary.accuracy ?? "-"}%</span>
                      <span>Correct: {summary.correct ?? "-"}</span>
                      <span>Wrong: {summary.wrong ?? "-"}</span>
                      <span>Attempted: {summary.attempted ?? "-"}</span>
                    </div>
                  </div>

                  <div className="attempt-actions">
                    <button
                      className="primary"
                      onClick={() => handleOpenAttempt(attempt.folderName)}
                      disabled={openingFolder === attempt.folderName}
                    >
                      {openingFolder === attempt.folderName ? "Opening..." : "Open"}
                    </button>

                    <button
                      onClick={() => handleExportSingleAttempt(attempt.folderName)}
                      disabled={openingFolder === attempt.folderName}
                    >
                      Export
                    </button>

                    <button
                      className="danger"
                      onClick={() => handleDeleteAttempt(attempt.folderName)}
                      disabled={deletingFolder === attempt.folderName}
                    >
                      {deletingFolder === attempt.folderName
                        ? "Deleting..."
                        : "Delete"}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

export default SavedAttempts;