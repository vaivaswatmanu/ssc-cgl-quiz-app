const express = require("express");
const router = express.Router();

const {
  saveAttempt,
  listAttempts,
  readAttempt,
  deleteAttempt,
} = require("../utils/fileStore");
function normalizeMode(mode) {
  if (mode === "mock") return "mock";
  return "quiz";
}

router.post("/save", (req, res) => {
  try {
    const { questions, submission, summary } = req.body;

    if (!questions || !submission || !summary) {
      return res.status(400).json({
        success: false,
        message: "questions, submission, and summary are required.",
      });
    }

    const savedAttempt = saveAttempt({
      questions,
      submission,
      summary,
    });

    return res.status(201).json({
      success: true,
      message: "Attempt saved successfully.",
      data: savedAttempt,
    });
  } catch (error) {
    console.error("Save attempt error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to save attempt.",
      error: error.message,
    });
  }
});

router.get("/", (req, res) => {
  try {
    const mode = normalizeMode(req.query.mode);
    const attempts = listAttempts(mode);

    return res.json({
      success: true,
      mode,
      data: attempts,
    });
  } catch (error) {
    console.error("List attempts error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to list attempts.",
      error: error.message,
    });
  }
});

router.get("/:mode/:folderName", (req, res) => {
  try {
    const mode = normalizeMode(req.params.mode);
    const { folderName } = req.params;

    const attempt = readAttempt(mode, folderName);

    if (!attempt) {
      return res.status(404).json({
        success: false,
        message: "Attempt not found.",
      });
    }

    return res.json({
      success: true,
      mode,
      data: attempt,
    });
  } catch (error) {
    console.error("Read attempt error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to read attempt.",
      error: error.message,
    });
  }
});
router.delete("/:mode/:folderName", (req, res) => {
  try {
    const mode = normalizeMode(req.params.mode);
    const { folderName } = req.params;

    const deleted = deleteAttempt(mode, folderName);

    if (!deleted) {
      return res.status(404).json({
        success: false,
        message: "Attempt not found.",
      });
    }

    return res.json({
      success: true,
      message: "Attempt deleted successfully.",
    });
  } catch (error) {
    console.error("Delete attempt error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to delete attempt.",
      error: error.message,
    });
  }
});
module.exports = router;