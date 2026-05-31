import { useEffect, useMemo, useRef, useState } from "react";
import QuestionView from "./QuestionView";
import QuestionPalette from "./QuestionPalette";
import Timer from "./Timer";

function createInitialResponses(testData) {
  const responses = {};

  testData.sections.forEach((section) => {
    section.questions.forEach((question) => {
      responses[question.questionId] = {
        questionId: question.questionId,
        selectedOptionId: null,
        markedForReview: false,
        visited: false,
        visitCount: 0,
        timeSpentSeconds: 0,
      };
    });
  });

  return responses;
}

function TestScreen({ testData, onBack, onSubmitTest }) {
  const [currentSectionIndex, setCurrentSectionIndex] = useState(0);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [responses, setResponses] = useState(() =>
    createInitialResponses(testData)
  );

  const [elapsedSeconds, setElapsedSeconds] = useState(0);
const [remainingSeconds, setRemainingSeconds] = useState(
  (testData.timer?.durationMinutes || 0) * 60
);

const [isPaused, setIsPaused] = useState(false);
const [pauseCount, setPauseCount] = useState(0);
const [totalPausedSeconds, setTotalPausedSeconds] = useState(0);

  const currentQuestionStartTimeRef = useRef(Date.now());
const submittedRef = useRef(false);
const responsesRef = useRef(responses);
const initialVisitMarkedRef = useRef(false);
const pauseStartTimeRef = useRef(null);
const isPausedRef = useRef(false);

  const currentSection = testData.sections[currentSectionIndex];
  const currentQuestion = currentSection.questions[currentQuestionIndex];
 useEffect(() => {
  isPausedRef.current = isPaused;
}, [isPaused]);
  const totalQuestions = useMemo(() => {
    return testData.sections.reduce(
      (sum, section) => sum + section.questions.length,
      0
    );
  }, [testData]);

  const globalQuestionNumber = useMemo(() => {
    let count = 0;

    for (let i = 0; i < currentSectionIndex; i++) {
      count += testData.sections[i].questions.length;
    }

    return count + currentQuestionIndex + 1;
  }, [testData, currentSectionIndex, currentQuestionIndex]);

  useEffect(() => {
  if (!initialVisitMarkedRef.current) {
    markCurrentQuestionVisited();
    currentQuestionStartTimeRef.current = Date.now();
    initialVisitMarkedRef.current = true;
  }

  // eslint-disable-next-line react-hooks/exhaustive-deps
}, []);

  useEffect(() => {
  const intervalId = setInterval(() => {
    if (isPausedRef.current || submittedRef.current) {
      return;
    }

    setElapsedSeconds((prev) => prev + 1);

    if (testData.timer.type === "strict") {
      setRemainingSeconds((prev) => {
        if (prev <= 1) {
          clearInterval(intervalId);
          autoSubmitTest();
          return 0;
        }

        return prev - 1;
      });
    }
  }, 1000);

  return () => clearInterval(intervalId);
  // eslint-disable-next-line react-hooks/exhaustive-deps
}, []);

  function saveCurrentQuestionTime() {
    if (isPausedRef.current) return;
  const now = Date.now();
  const secondsSpent = Math.max(
    0,
    Math.round((now - currentQuestionStartTimeRef.current) / 1000)
  );

  setResponses((prev) => {
    const existing = prev[currentQuestion.questionId];

    const updated = {
      ...prev,
      [currentQuestion.questionId]: {
        ...existing,
        timeSpentSeconds: (existing?.timeSpentSeconds || 0) + secondsSpent,
      },
    };

    responsesRef.current = updated;
    return updated;
  });

  currentQuestionStartTimeRef.current = now;
}

  function markCurrentQuestionVisited() {
  setResponses((prev) => {
    const existing = prev[currentQuestion.questionId];

    const updated = {
      ...prev,
      [currentQuestion.questionId]: {
        ...existing,
        visited: true,
        visitCount: (existing?.visitCount || 0) + 1,
      },
    };

    responsesRef.current = updated;
    return updated;
  });
}

  function moveToQuestion(sectionIndex, questionIndex) {
    saveCurrentQuestionTime();

    setCurrentSectionIndex(sectionIndex);
    setCurrentQuestionIndex(questionIndex);

    setTimeout(() => {
      const nextQuestion = testData.sections[sectionIndex].questions[questionIndex];

      setResponses((prev) => {
  const existing = prev[nextQuestion.questionId];

  const updated = {
    ...prev,
    [nextQuestion.questionId]: {
      ...existing,
      visited: true,
      visitCount: (existing?.visitCount || 0) + 1,
    },
  };

  responsesRef.current = updated;
  return updated;
});

      currentQuestionStartTimeRef.current = Date.now();
    }, 0);
  }

  function handleSelectOption(optionId) {
  setResponses((prev) => {
    const existing = prev[currentQuestion.questionId];

    const updated = {
      ...prev,
      [currentQuestion.questionId]: {
        ...existing,
        selectedOptionId: optionId,
        visited: true,
      },
    };

    responsesRef.current = updated;
    return updated;
  });
}

  function handleClearResponse() {
  setResponses((prev) => {
    const existing = prev[currentQuestion.questionId];

    const updated = {
      ...prev,
      [currentQuestion.questionId]: {
        ...existing,
        selectedOptionId: null,
        visited: true,
      },
    };

    responsesRef.current = updated;
    return updated;
  });
}

  function handleMarkForReview() {
  setResponses((prev) => {
    const existing = prev[currentQuestion.questionId];

    const updated = {
      ...prev,
      [currentQuestion.questionId]: {
        ...existing,
        markedForReview: !existing.markedForReview,
        visited: true,
      },
    };

    responsesRef.current = updated;
    return updated;
  });
}

  function goToNextQuestion() {
    const isLastQuestionInSection =
      currentQuestionIndex === currentSection.questions.length - 1;
    const isLastSection = currentSectionIndex === testData.sections.length - 1;

    if (!isLastQuestionInSection) {
      moveToQuestion(currentSectionIndex, currentQuestionIndex + 1);
      return;
    }
    if (isSectionalMock) {
  alert(
    "You have reached the end of this section. Click Submit Section to move ahead."
  );
  return;
}

    if (!isLastSection) {
      moveToQuestion(currentSectionIndex + 1, 0);
    }
  }

  function goToPreviousQuestion() {
    const isFirstQuestionInSection = currentQuestionIndex === 0;
    const isFirstSection = currentSectionIndex === 0;

    if (!isFirstQuestionInSection) {
      moveToQuestion(currentSectionIndex, currentQuestionIndex - 1);
      return;
    }

    if (!isFirstSection) {
      const previousSectionIndex = currentSectionIndex - 1;
      const previousSection = testData.sections[previousSectionIndex];

      moveToQuestion(
        previousSectionIndex,
        previousSection.questions.length - 1
      );
    }
  }

  function handleJumpToQuestion(sectionIndex, questionIndex) {
    moveToQuestion(sectionIndex, questionIndex);
  }

  function handleSectionClick(sectionIndex) {
    moveToQuestion(sectionIndex, 0);
  }

  function buildFinalResponses() {
    if (isPausedRef.current) {
  return responsesRef.current;
}
  const latestResponses = responsesRef.current;

  const now = Date.now();
  const secondsSpent = Math.max(
    0,
    Math.round((now - currentQuestionStartTimeRef.current) / 1000)
  );

  const existing = latestResponses[currentQuestion.questionId];

  return {
    ...latestResponses,
    [currentQuestion.questionId]: {
      ...existing,
      timeSpentSeconds:
        (existing?.timeSpentSeconds || 0) + secondsSpent,
    },
  };
}
function handlePauseTest() {
  if (submittedRef.current || isPausedRef.current) return;

  saveCurrentQuestionTime();

  pauseStartTimeRef.current = Date.now();
  setPauseCount((prev) => prev + 1);
  setIsPaused(true);
}

function handleResumeTest() {
  if (!isPausedRef.current) return;

  const now = Date.now();

  if (pauseStartTimeRef.current) {
    const pausedSeconds = Math.max(
      0,
      Math.round((now - pauseStartTimeRef.current) / 1000)
    );

    setTotalPausedSeconds((prev) => prev + pausedSeconds);
  }

  pauseStartTimeRef.current = null;
  currentQuestionStartTimeRef.current = Date.now();
  setIsPaused(false);
}
  function submitTest({ skipConfirm = false } = {}) {
    if (submittedRef.current) return;

    if (!skipConfirm) {
      const confirmSubmit = window.confirm(
        "Are you sure you want to submit the test?"
      );

      if (!confirmSubmit) return;
    }

    submittedRef.current = true;

    const finalResponses = buildFinalResponses();

    onSubmitTest({
  responses: finalResponses,
  submittedAt: new Date().toISOString(),
  totalTimeSeconds: elapsedSeconds,
  timerType: testData.timer.type,
  autoSubmitted: skipConfirm,
  pauseCount,
  totalPausedSeconds,
});
  }

  function autoSubmitTest() {
    submitTest({ skipConfirm: true });
  }

  const currentResponse = responses[currentQuestion.questionId];

  return (
    <div className="test-page">
      <header className="test-header">
        <div>
          <h1>{testData.testName}</h1>
          <p>{testData.exam}</p>
        </div>

        <div className="test-header-right">
          <Timer
  timerType={testData.timer.type}
  elapsedSeconds={elapsedSeconds}
  remainingSeconds={remainingSeconds}
  isPaused={isPaused}
/>

{isPaused ? (
  <button className="primary" onClick={handleResumeTest}>
    Resume
  </button>
) : (
  <button onClick={handlePauseTest}>Pause</button>
)}

<button className="danger" onClick={() => submitTest()} disabled={isPaused}>
  Submit Test
</button>
        </div>
      </header>

      <div className="section-tabs">
        {testData.sections.map((section, index) => (
          <button
  key={section.sectionId}
  className={index === currentSectionIndex ? "active" : ""}
  onClick={() => handleSectionClick(index)}
  disabled={isPaused}
>
            {section.sectionName}
          </button>
        ))}
      </div>

      <main className="test-layout">
        <section className="question-area">
          <QuestionView
  question={currentQuestion}
  questionNumber={globalQuestionNumber}
  totalQuestions={totalQuestions}
  selectedOptionId={currentResponse?.selectedOptionId}
  onSelectOption={handleSelectOption}
  disabled={isPaused}
/>

          <div className="question-tracking-row">
            <span>Visits: {currentResponse?.visitCount || 0}</span>
            <span>
              Time spent: {currentResponse?.timeSpentSeconds || 0}s
            </span>
          </div>

          <div className="action-bar">
            <button onClick={goToPreviousQuestion} disabled={isPaused}>Previous</button>

            <button onClick={handleClearResponse} disabled={isPaused}>Clear Response</button>

            <button
              className={currentResponse?.markedForReview ? "warning" : ""}
              onClick={handleMarkForReview} disabled={isPaused}
            >
              {currentResponse?.markedForReview
                ? "Unmark Review"
                : "Mark for Review"}
            </button>

            <button className="primary" onClick={goToNextQuestion} disabled={isPaused}>
              Save & Next
            </button>
          </div>
        </section>

        <QuestionPalette
  sections={testData.sections}
  responses={responses}
  currentSectionIndex={currentSectionIndex}
  currentQuestionIndex={currentQuestionIndex}
  onJumpToQuestion={handleJumpToQuestion}
  disabled={isPaused}
/>
      </main>

      <div className="bottom-bar">
        <button onClick={onBack}>Back to JSON</button>
      </div>
    </div>
  );
}

export default TestScreen;