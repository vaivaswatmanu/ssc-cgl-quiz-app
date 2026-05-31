import { formatSeconds } from "../utils/timeUtils";
function getQuestionStatus(question, response) {
  const selectedOptionId = response?.selectedOptionId;

  if (!selectedOptionId) return "unattempted";
  if (selectedOptionId === question.correctOptionId) return "correct";
  return "wrong";
}

function getOptionClass(question, option, response) {
  const selectedOptionId = response?.selectedOptionId;
  const isCorrect = option.id === question.correctOptionId;
  const isSelected = option.id === selectedOptionId;

  if (isCorrect) return "review-option correct-option";
  if (isSelected && !isCorrect) return "review-option wrong-option";
  return "review-option";
}

function ReviewScreen({ testData, submission, summary, onBackToResult, onBackToHome }) {
  return (
    <div className="page">
      <div className="card wide-card">
        <div className="header-row">
          <div>
            <h1>Answer Review</h1>
            <p className="muted">{summary.testName}</p>
          </div>
          <div className="badge">Score: {summary.score}</div>
        </div>

        <div className="button-row">
          <button onClick={onBackToResult}>Back to Result</button>
          <button onClick={onBackToHome}>Back to Home</button>
        </div>

        {testData.sections.map((section) => (
          <div key={section.sectionId} className="review-section">
            <h2>{section.sectionName}</h2>

            {section.questions.map((question, questionIndex) => {
              const response = submission.responses[question.questionId];
              const status = getQuestionStatus(question, response);

              return (
                <div key={question.questionId} className="review-question-card">
                 <div className="review-question-header">
  <div>
    <h3>
      Q{questionIndex + 1}. {question.questionText}
    </h3>

    <div className="review-tracking-badges">
      <span>Visits: {response?.visitCount || 0}</span>
      <span>Time: {formatSeconds(response?.timeSpentSeconds || 0)}</span>
      {response?.markedForReview && <span>Marked</span>}
    </div>
  </div>

  <span className={`review-status ${status}`}>
    {status.toUpperCase()}
  </span>
</div>

                  <div className="review-options">
                    {question.options.map((option) => (
                      <div
                        key={option.id}
                        className={getOptionClass(question, option, response)}
                      >
                        <strong>{option.id}.</strong> {option.text}
                      </div>
                    ))}
                  </div>

                  <div className="review-meta">
  <p>
    <strong>Your Answer:</strong>{" "}
    {response?.selectedOptionId || "Not Attempted"}
  </p>

  <p>
    <strong>Correct Answer:</strong> {question.correctOptionId}
  </p>

  <p>
    <strong>Visits:</strong> {response?.visitCount || 0}
  </p>

  <p>
    <strong>Time Taken:</strong>{" "}
    {formatSeconds(response?.timeSpentSeconds || 0)}
  </p>

  <p>
    <strong>Marked for Review:</strong>{" "}
    {response?.markedForReview ? "Yes" : "No"}
  </p>
</div>

                  <div className="solution-box">
                    <strong>Solution:</strong> {question.solution}
                  </div>
                </div>
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
}

export default ReviewScreen;