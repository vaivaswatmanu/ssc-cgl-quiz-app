export function validateTestJson(data) {
  const errors = [];
  const allQuestionIds = new Set();

  if (!data || typeof data !== "object" || Array.isArray(data)) {
    errors.push("JSON must be a valid object.");
    return errors;
  }

  if (!data.testId || typeof data.testId !== "string") {
    errors.push("Missing or invalid testId.");
  }

  if (!data.testName || typeof data.testName !== "string") {
    errors.push("Missing or invalid testName.");
  }

  if (!["quiz", "mock"].includes(data.mode)) {
    errors.push("mode must be either 'quiz' or 'mock'.");
  }

  if (!data.exam || typeof data.exam !== "string") {
    errors.push("Missing or invalid exam.");
  }

  if (!data.marking || typeof data.marking !== "object") {
    errors.push("Missing marking object.");
  } else {
    if (typeof data.marking.correct !== "number") {
      errors.push("marking.correct must be a number.");
    }

    if (typeof data.marking.wrong !== "number") {
      errors.push("marking.wrong must be a number.");
    }

    if (typeof data.marking.unattempted !== "number") {
      errors.push("marking.unattempted must be a number.");
    }
  }

  if (!data.timer || typeof data.timer !== "object") {
  errors.push("Missing timer object.");
} else {
  if (!["none", "practice", "strict"].includes(data.timer.type)) {
    errors.push("timer.type must be 'none', 'practice', or 'strict'.");
  }

  if (
    data.timer.mode &&
    !["test", "sectional"].includes(data.timer.mode)
  ) {
    errors.push("timer.mode must be either 'test' or 'sectional'.");
  }

  if (data.timer.mode === "sectional" && data.mode !== "mock") {
    errors.push("sectional timer mode is allowed only for mock mode.");
  }

  if (data.timer.type !== "none") {
    if (typeof data.timer.durationMinutes !== "number") {
      errors.push("timer.durationMinutes must be a number.");
    } else if (data.timer.durationMinutes <= 0) {
      errors.push("timer.durationMinutes must be greater than 0.");
    }
  }
}

  if (!Array.isArray(data.sections) || data.sections.length === 0) {
    errors.push("sections must be a non-empty array.");
    return errors;
  }

  if (data.mode === "quiz" && data.sections.length !== 1) {
    errors.push("quiz mode must have exactly one section.");
  }

  if (data.mode === "mock" && data.sections.length < 2) {
    errors.push("mock mode should have at least two sections.");
  }

  data.sections.forEach((section, sectionIndex) => {
    const sectionLabel = `Section ${sectionIndex + 1}`;

    if (!section.sectionId || typeof section.sectionId !== "string") {
      errors.push(`${sectionLabel}: missing or invalid sectionId.`);
    }

    if (!section.sectionName || typeof section.sectionName !== "string") {
      errors.push(`${sectionLabel}: missing or invalid sectionName.`);
    }

    if (!Array.isArray(section.questions) || section.questions.length === 0) {
      errors.push(`${sectionLabel}: questions must be a non-empty array.`);
      return;
    }

    section.questions.forEach((question, questionIndex) => {
      const label = `${section.sectionName || sectionLabel} Q${questionIndex + 1}`;

      if (!question.questionId || typeof question.questionId !== "string") {
        errors.push(`${label}: missing or invalid questionId.`);
      } else if (allQuestionIds.has(question.questionId)) {
        errors.push(`${label}: duplicate questionId '${question.questionId}'.`);
      } else {
        allQuestionIds.add(question.questionId);
      }

      if (
        !question.questionText ||
        typeof question.questionText !== "string" ||
        question.questionText.trim() === ""
      ) {
        errors.push(`${label}: missing questionText.`);
      }

      if (!Array.isArray(question.options) || question.options.length !== 4) {
        errors.push(`${label}: options must contain exactly 4 options.`);
      } else {
        const optionIds = new Set();

        question.options.forEach((option, optionIndex) => {
          const optionLabel = `${label} option ${optionIndex + 1}`;

          if (!option.id || typeof option.id !== "string") {
            errors.push(`${optionLabel}: missing or invalid id.`);
          } else if (optionIds.has(option.id)) {
            errors.push(`${label}: duplicate option id '${option.id}'.`);
          } else {
            optionIds.add(option.id);
          }

          if (
            !option.text ||
            typeof option.text !== "string" ||
            option.text.trim() === ""
          ) {
            errors.push(`${optionLabel}: missing option text.`);
          }
        });

        if (
          question.correctOptionId &&
          !question.options.some((option) => option.id === question.correctOptionId)
        ) {
          errors.push(
            `${label}: correctOptionId '${question.correctOptionId}' does not match any option id.`
          );
        }
      }

      if (
        !question.correctOptionId ||
        typeof question.correctOptionId !== "string"
      ) {
        errors.push(`${label}: missing or invalid correctOptionId.`);
      }

      if (
        !question.solution ||
        typeof question.solution !== "string" ||
        question.solution.trim() === ""
      ) {
        errors.push(`${label}: missing solution.`);
      }
    });
  });

  return errors;
}