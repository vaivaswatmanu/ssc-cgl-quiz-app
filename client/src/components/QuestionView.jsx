function QuestionView({
  question,
  questionNumber,
  totalQuestions,
  selectedOptionId,
  onSelectOption,
  disabled = false,
}) {
  return (
    <div className="question-card">
      <div className="question-top-row">
        <h2>
          Question {questionNumber} of {totalQuestions}
        </h2>
      </div>

      <p className="question-text">{question.questionText}</p>

      <div className="options-list">
        {question.options.map((option) => {
          const isSelected = selectedOptionId === option.id;

          return (
            <button
  key={option.id}
  className={`option-btn ${isSelected ? "selected" : ""}`}
  onClick={() => onSelectOption(option.id)}
  disabled={disabled}
>
              <span className="option-id">{option.id}</span>
              <span>{option.text}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

export default QuestionView;