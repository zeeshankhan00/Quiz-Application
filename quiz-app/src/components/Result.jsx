export default function Result({ quiz, score, total, onRestart }) {
  const percent = total > 0 ? Math.round((score / total) * 100) : 0;

  let message = 'Keep practicing!';
  if (percent >= 80) message = 'Excellent work!';
  else if (percent >= 50) message = 'Good effort!';

  return (
    <div className="result">
      <h1>Quiz Complete</h1>
      <p className="result-quiz-title">{quiz.title}</p>

      <div className="score-circle">
        <span className="score-number">{score}</span>
        <span className="score-divider">/ {total}</span>
      </div>

      <p className="result-percent">{percent}% correct</p>
      <p className="result-message">{message}</p>

      <button className="restart-button" onClick={onRestart}>
        Try Another Topic
      </button>
    </div>
  );
}
