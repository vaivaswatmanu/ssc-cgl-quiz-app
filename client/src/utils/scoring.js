export function calculateResult(testData, responses) {
  const marking = testData.marking || {
    correct: 2,
    wrong: -0.5,
    unattempted: 0,
  };

  let totalQuestions = 0;
  let attempted = 0;
  let correct = 0;
  let wrong = 0;
  let unattempted = 0;
  let score = 0;

  const sectionResults = [];

  testData.sections.forEach((section) => {
    let sectionTotal = 0;
    let sectionAttempted = 0;
    let sectionCorrect = 0;
    let sectionWrong = 0;
    let sectionUnattempted = 0;
    let sectionScore = 0;

    section.questions.forEach((question) => {
      totalQuestions++;
      sectionTotal++;

      const response = responses[question.questionId];
      const selectedOptionId = response?.selectedOptionId;

      if (!selectedOptionId) {
        unattempted++;
        sectionUnattempted++;
        score += marking.unattempted;
        sectionScore += marking.unattempted;
      } else if (selectedOptionId === question.correctOptionId) {
        attempted++;
        correct++;
        sectionAttempted++;
        sectionCorrect++;
        score += marking.correct;
        sectionScore += marking.correct;
      } else {
        attempted++;
        wrong++;
        sectionAttempted++;
        sectionWrong++;
        score += marking.wrong;
        sectionScore += marking.wrong;
      }
    });

    sectionResults.push({
      sectionId: section.sectionId,
      sectionName: section.sectionName,
      totalQuestions: sectionTotal,
      attempted: sectionAttempted,
      correct: sectionCorrect,
      wrong: sectionWrong,
      unattempted: sectionUnattempted,
      score: sectionScore,
      accuracy:
        sectionAttempted === 0
          ? 0
          : Number(((sectionCorrect / sectionAttempted) * 100).toFixed(2)),
    });
  });

  const maxScore = totalQuestions * marking.correct;

return {
  testId: testData.testId,
  testName: testData.testName,
  mode: testData.mode,
  exam: testData.exam,
  totalQuestions,
  attempted,
  correct,
  wrong,
  unattempted,
  score,
  maxScore,
  accuracy:
    attempted === 0 ? 0 : Number(((correct / attempted) * 100).toFixed(2)),
  sectionResults,
};
}