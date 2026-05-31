function getQuestionStatus(response) {
  if (!response || !response.visited) return "not-visited";
  if (response.selectedOptionId && response.markedForReview) {
    return "answered-marked";
  }
  if (response.markedForReview) return "marked";
  if (response.selectedOptionId) return "answered";
  return "visited";
}

function getStatusLabel(status) {
  const labels = {
    "not-visited": "Not Visited",
    visited: "Visited",
    answered: "Answered",
    marked: "Marked",
    "answered-marked": "Answered + Marked",
  };

  return labels[status] || status;
}

function QuestionPalette({
  sections,
  responses,
  currentSectionIndex,
  currentQuestionIndex,
  onJumpToQuestion,
  disabled = false,
}) {
  return (
    <aside className="palette-panel">
      <h3>Question Palette</h3>

      {sections.map((section, sectionIndex) => (
        <div className="palette-section" key={section.sectionId}>
          <h4>{section.sectionName}</h4>

          <div className="palette-grid">
            {section.questions.map((question, questionIndex) => {
              const response = responses[question.questionId];
              const status = getQuestionStatus(response);
              const isActive =
                currentSectionIndex === sectionIndex &&
                currentQuestionIndex === questionIndex;

              return (
                <button
  key={question.questionId}
  className={`palette-btn ${status} ${isActive ? "active" : ""}`}
  title={getStatusLabel(status)}
  onClick={() => onJumpToQuestion(sectionIndex, questionIndex)}
  disabled={disabled}
>
                  {questionIndex + 1}
                </button>
              );
            })}
          </div>
        </div>
      ))}

      <div className="legend">
        <div>
          <span className="legend-box not-visited"></span> Not Visited
        </div>
        <div>
          <span className="legend-box visited"></span> Visited
        </div>
        <div>
          <span className="legend-box answered"></span> Answered
        </div>
        <div>
          <span className="legend-box marked"></span> Marked
        </div>
        <div>
          <span className="legend-box answered-marked"></span> Ans + Marked
        </div>
      </div>
    </aside>
  );
}

export default QuestionPalette;