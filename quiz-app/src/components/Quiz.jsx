import { useEffect, useState } from 'react';

const SECONDS_PER_QUESTION = 30;

export default function Quiz({ quiz, questions, onFinish }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selected, setSelected] = useState(null);
  const [answers, setAnswers] = useState([]); // [{ questionId, response }]
  const [timeLeft, setTimeLeft] = useState(SECONDS_PER_QUESTION);

  const currentQuestion = questions[currentIndex];
  const isLastQuestion = currentIndex === questions.length - 1;

  // Reset timer + selection whenever we move to a new question
  useEffect(() => {
    setSelected(null);
    setTimeLeft(SECONDS_PER_QUESTION);
  }, [currentIndex]);

  // Countdown
  useEffect(() => {
    if (timeLeft <= 0) {
      goToNext(selected);
      return;
    }
    const timer = setTimeout(() => setTimeLeft((t) => t - 1), 1000);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [timeLeft]);

  function goToNext(chosenOption) {
    const updatedAnswers = [
      ...answers,
      { questionId: currentQuestion.id, response: chosenOption ?? '' },
    ];

    if (isLastQuestion) {
      onFinish(updatedAnswers);
    } else {
      setAnswers(updatedAnswers);
      setCurrentIndex((i) => i + 1);
    }
  }

  function handleOptionClick(option) {
    setSelected(option);
  }

  function handleNextClick() {
    goToNext(selected);
  }

  if (!currentQuestion) {
    return <p className="status-text">No questions available for this quiz.</p>;
  }

  const timerPercent = (timeLeft / SECONDS_PER_QUESTION) * 100;
  const timerLow = timeLeft <= 10;

  return (
    <div className="quiz">
      <div className="quiz-header">
        <span className="quiz-title">{quiz.title}</span>
        <span className="quiz-progress">
          Question {currentIndex + 1} of {questions.length}
        </span>
      </div>

      <div className="timer-bar-track">
        <div
          className={`timer-bar-fill ${timerLow ? 'timer-low' : ''}`}
          style={{ width: `${timerPercent}%` }}
        />
      </div>
      <div className={`timer-text ${timerLow ? 'timer-low-text' : ''}`}>{timeLeft}s</div>

      <h2 className="question-text">{currentQuestion.text}</h2>

      <div className="options-list">
        {currentQuestion.options.map((option, idx) => (
          <button
            key={idx}
            className={`option-button ${selected === option ? 'option-selected' : ''}`}
            onClick={() => handleOptionClick(option)}
          >
            {option}
          </button>
        ))}
      </div>

      <button
        className="next-button"
        onClick={handleNextClick}
        disabled={selected === null}
      >
        {isLastQuestion ? 'Submit Quiz' : 'Next Question'}
      </button>
    </div>
  );
}
