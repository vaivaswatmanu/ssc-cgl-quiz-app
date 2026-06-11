const fs = require("fs");
const path = require("path");
const slugify = require("./slugify");

const DATA_DIR = path.join(__dirname, "..", "data");
const SUBJECTS_DIR = path.join(DATA_DIR, "subjects");

const LEGACY_MODE_DIR_MAP = {
  quiz: "quiz-attempts",
  mock: "mock-attempts",
};

function normalizeMode(mode) {
  return mode === "mock" ? "mock" : "quiz";
}

function normalizeSubject(subject) {
  return slugify(subject || "general");
}

function ensureDir(dirPath) {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }
}

function getSubjectAttemptsDir(subject, mode) {
  const safeSubject = normalizeSubject(subject);
  const safeMode = normalizeMode(mode);

  return path.join(SUBJECTS_DIR, safeSubject, safeMode);
}

function getLegacyAttemptsDir(mode) {
  const safeMode = normalizeMode(mode);
  return path.join(DATA_DIR, LEGACY_MODE_DIR_MAP[safeMode]);
}

function getLocalDateTimeFolderName(testName) {
  const now = new Date();
  const pad = (num) => String(num).padStart(2, "0");

  const datePart = [
    now.getFullYear(),
    pad(now.getMonth() + 1),
    pad(now.getDate()),
  ].join("-");

  const timePart = [
    pad(now.getHours()),
    pad(now.getMinutes()),
    pad(now.getSeconds()),
  ].join("-");

  return `${datePart}__${timePart}__${slugify(testName)}`;
}

function writeJsonFile(folderPath, fileName, data) {
  fs.writeFileSync(
    path.join(folderPath, fileName),
    JSON.stringify(data, null, 2),
    "utf-8"
  );
}

function getAttemptMode({ questions, submission, summary }) {
  const mode = questions?.mode || submission?.mode || summary?.mode;
  return normalizeMode(mode);
}

function getAttemptSubject({ questions, submission, summary }) {
  return (
    questions?.subject ||
    submission?.subject ||
    summary?.subject ||
    (questions?.mode === "mock" ? "full-mock" : "general")
  );
}

function saveAttempt({ questions, submission, summary }) {
  const mode = getAttemptMode({ questions, submission, summary });
  const subject = getAttemptSubject({ questions, submission, summary });

  const attemptsDir = getSubjectAttemptsDir(subject, mode);
  ensureDir(attemptsDir);

  const testName =
    questions?.testName ||
    summary?.testName ||
    submission?.testName ||
    "untitled-test";

  const folderName = getLocalDateTimeFolderName(testName);
  const folderPath = path.join(attemptsDir, folderName);

  fs.mkdirSync(folderPath, { recursive: true });

  writeJsonFile(folderPath, "questions.json", questions);
  writeJsonFile(folderPath, "submission.json", submission);
  writeJsonFile(folderPath, "summary.json", summary);

  return {
    mode,
    subject: normalizeSubject(subject),
    folderName,
    folderPath,
    files: ["questions.json", "submission.json", "summary.json"],
  };
}

function readSummary(folderPath) {
  try {
    const summaryPath = path.join(folderPath, "summary.json");

    if (!fs.existsSync(summaryPath)) return null;

    return JSON.parse(fs.readFileSync(summaryPath, "utf-8"));
  } catch {
    return null;
  }
}

function listSubjectAttempts(mode) {
  const safeMode = normalizeMode(mode);

  if (!fs.existsSync(SUBJECTS_DIR)) {
    return [];
  }

  const subjects = fs
    .readdirSync(SUBJECTS_DIR, { withFileTypes: true })
    .filter((item) => item.isDirectory())
    .map((item) => item.name);

  const attempts = [];

  subjects.forEach((subject) => {
    const attemptsDir = getSubjectAttemptsDir(subject, safeMode);

    if (!fs.existsSync(attemptsDir)) return;

    fs.readdirSync(attemptsDir, { withFileTypes: true })
      .filter((item) => item.isDirectory())
      .forEach((item) => {
        const folderPath = path.join(attemptsDir, item.name);

        attempts.push({
          mode: safeMode,
          subject,
          folderName: item.name,
          summary: readSummary(folderPath),
        });
      });
  });

  return attempts;
}

function listLegacyAttempts(mode) {
  const safeMode = normalizeMode(mode);
  const attemptsDir = getLegacyAttemptsDir(safeMode);

  if (!fs.existsSync(attemptsDir)) return [];

  return fs
    .readdirSync(attemptsDir, { withFileTypes: true })
    .filter((item) => item.isDirectory())
    .map((item) => {
      const folderPath = path.join(attemptsDir, item.name);

      return {
        mode: safeMode,
        subject: "legacy",
        folderName: item.name,
        summary: readSummary(folderPath),
      };
    });
}

function listAttempts(mode = "quiz") {
  const safeMode = normalizeMode(mode);

  return [...listSubjectAttempts(safeMode), ...listLegacyAttempts(safeMode)].sort(
    (a, b) => b.folderName.localeCompare(a.folderName)
  );
}

function readAttemptFromFolder(mode, subject, folderName) {
  const safeMode = normalizeMode(mode);
  const safeFolderName = path.basename(folderName);
  const folderPath = path.join(
    getSubjectAttemptsDir(subject, safeMode),
    safeFolderName
  );

  if (!fs.existsSync(folderPath)) return null;

  const questionsPath = path.join(folderPath, "questions.json");
  const submissionPath = path.join(folderPath, "submission.json");
  const summaryPath = path.join(folderPath, "summary.json");

  if (
    !fs.existsSync(questionsPath) ||
    !fs.existsSync(submissionPath) ||
    !fs.existsSync(summaryPath)
  ) {
    return null;
  }

  return {
    mode: safeMode,
    subject,
    folderName: safeFolderName,
    questions: JSON.parse(fs.readFileSync(questionsPath, "utf-8")),
    submission: JSON.parse(fs.readFileSync(submissionPath, "utf-8")),
    summary: JSON.parse(fs.readFileSync(summaryPath, "utf-8")),
  };
}

function readLegacyAttempt(mode, folderName) {
  const safeMode = normalizeMode(mode);
  const safeFolderName = path.basename(folderName);
  const folderPath = path.join(getLegacyAttemptsDir(safeMode), safeFolderName);

  if (!fs.existsSync(folderPath)) return null;

  return {
    mode: safeMode,
    subject: "legacy",
    folderName: safeFolderName,
    questions: JSON.parse(
      fs.readFileSync(path.join(folderPath, "questions.json"), "utf-8")
    ),
    submission: JSON.parse(
      fs.readFileSync(path.join(folderPath, "submission.json"), "utf-8")
    ),
    summary: JSON.parse(
      fs.readFileSync(path.join(folderPath, "summary.json"), "utf-8")
    ),
  };
}

function readAttempt(mode = "quiz", folderName) {
  const safeMode = normalizeMode(mode);

  if (fs.existsSync(SUBJECTS_DIR)) {
    const subjects = fs
      .readdirSync(SUBJECTS_DIR, { withFileTypes: true })
      .filter((item) => item.isDirectory())
      .map((item) => item.name);

    for (const subject of subjects) {
      const attempt = readAttemptFromFolder(safeMode, subject, folderName);
      if (attempt) return attempt;
    }
  }

  return readLegacyAttempt(safeMode, folderName);
}

function deleteAttempt(mode = "quiz", folderName) {
  const attempt = readAttempt(mode, folderName);

  if (!attempt) return false;

  const safeFolderName = path.basename(folderName);

  const folderPath =
    attempt.subject === "legacy"
      ? path.join(getLegacyAttemptsDir(mode), safeFolderName)
      : path.join(getSubjectAttemptsDir(attempt.subject, mode), safeFolderName);

  if (!fs.existsSync(folderPath)) return false;

  fs.rmSync(folderPath, { recursive: true, force: true });
  return true;
}

module.exports = {
  saveAttempt,
  listAttempts,
  readAttempt,
  deleteAttempt,
};