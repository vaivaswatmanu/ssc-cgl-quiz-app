function formatTime(totalSeconds) {
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  const pad = (num) => String(num).padStart(2, "0");

  if (hours > 0) {
    return `${pad(hours)}:${pad(minutes)}:${pad(seconds)}`;
  }

  return `${pad(minutes)}:${pad(seconds)}`;
}

function Timer({ timerType, elapsedSeconds, remainingSeconds, isPaused }) {
  if (isPaused) {
    return <span className="timer-box paused">Paused</span>;
  }

  if (timerType === "none") {
    return <span className="timer-box">No Timer</span>;
  }

  if (timerType === "strict") {
    const isLowTime = remainingSeconds <= 60;

    return (
      <span className={`timer-box ${isLowTime ? "low-time" : ""}`}>
        Time Left: {formatTime(Math.max(remainingSeconds, 0))}
      </span>
    );
  }

  return <span className="timer-box">Time: {formatTime(elapsedSeconds)}</span>;
}

export default Timer;