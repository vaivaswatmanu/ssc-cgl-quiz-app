const fs = require("fs");
const path = require("path");
const slugify = require("./slugify");

const DATA_DIR = path.join(__dirname, "..", "data");

const MODE_DIR_MAP = {
  quiz: "quiz-attempts",
  mock: "mock-attempts",
};

function getModeFolderName(mode) {
  return MODE_DIR_MAP[mode] || "quiz-attempts";
}

function getAttemptsDir(mode) {
  return path.join(DATA_DIR, getModeFolderName(mode));
}

function ensureAttemptsDir(mode) {
  const attemptsDir = getAttemptsDir(mode);

  if (!fs.existsSync(attemptsDir)) {
    fs.mkdirSync(attemptsDir, { recursive: true });
  }

  return attemptsDir;
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
  const filePath = path.join(folderPath, fileName);
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2), "utf-8");
}

function getAttemptMode({ questions, submission, summary }) {
  const mode = questions?.mode || submission?.mode || summary?.mode;

  if (mode === "mock") return "mock";
  return "quiz";
}

function saveAttempt({ questions, submission, summary }) {
  const mode = getAttemptMode({ questions, submission, summary });
  const attemptsDir = ensureAttemptsDir(mode);

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
    folderName,
    folderPath,
    files: ["questions.json", "submission.json", "summary.json"],
  };
}

function listAttempts(mode = "quiz") {
  const attemptsDir = ensureAttemptsDir(mode);

  const folders = fs
    .readdirSync(attemptsDir, { withFileTypes: true })
    .filter((item) => item.isDirectory())
    .map((item) => {
      const folderName = item.name;
      const folderPath = path.join(attemptsDir, folderName);

      let summary = null;

      try {
        const summaryPath = path.join(folderPath, "summary.json");

        if (fs.existsSync(summaryPath)) {
          summary = JSON.parse(fs.readFileSync(summaryPath, "utf-8"));
        }
      } catch (error) {
        summary = null;
      }

      return {
        mode,
        folderName,
        summary,
      };
    })
    .sort((a, b) => b.folderName.localeCompare(a.folderName));

  return folders;
}

function readAttempt(mode = "quiz", folderName) {
  const attemptsDir = ensureAttemptsDir(mode);

  const safeFolderName = path.basename(folderName);
  const folderPath = path.join(attemptsDir, safeFolderName);

  if (!fs.existsSync(folderPath)) {
    return null;
  }

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

  const questions = JSON.parse(fs.readFileSync(questionsPath, "utf-8"));
  const submission = JSON.parse(fs.readFileSync(submissionPath, "utf-8"));
  const summary = JSON.parse(fs.readFileSync(summaryPath, "utf-8"));

  return {
    mode,
    folderName: safeFolderName,
    questions,
    submission,
    summary,
  };
}
function deleteAttempt(mode = "quiz", folderName) {
  const attemptsDir = ensureAttemptsDir(mode);

  const safeFolderName = path.basename(folderName);
  const folderPath = path.join(attemptsDir, safeFolderName);

  if (!fs.existsSync(folderPath)) {
    return false;
  }

  fs.rmSync(folderPath, { recursive: true, force: true });
  return true;
}
module.exports = {
  saveAttempt,
  listAttempts,
  readAttempt,
  deleteAttempt,
};