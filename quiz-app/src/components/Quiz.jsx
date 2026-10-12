import { useEffect, useRef, useState } from 'react';
import DifficultyBadge from './DifficultyBadge.jsx';

const SECONDS_PER_QUESTION = 30;

export default function Quiz({ quiz, questions, onFinish, onGiveUp }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selected, setSelected] = useState(null);
  const [answers, setAnswers] = useState([]); // [{ questionId, response }]
  const [timeLeft, setTimeLeft] = useState(SECONDS_PER_QUESTION);
  const [showGiveUpModal, setShowGiveUpModal] = useState(false);
  const advancedQuestionId = useRef(null);

  const currentQuestion = questions[currentIndex];
  const isLastQuestion = currentIndex === questions.length - 1;

  // Countdown
  useEffect(() => {
    if (showGiveUpModal || !currentQuestion) return; // pause timer while modal is open
    if (timeLeft <= 0) {
      goToNext(selected);
      return;
    }
    const timer = setTimeout(() => setTimeLeft((t) => t - 1), 1000);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentIndex, timeLeft, showGiveUpModal]);

  function goToNext(chosenOption) {
    // A click and the timeout must not advance the same question twice.
    if (!currentQuestion || advancedQuestionId.current === currentQuestion.id) return;
    advancedQuestionId.current = currentQuestion.id;
    const updatedAnswers = [
      ...answers,
      { questionId: currentQuestion.id, response: chosenOption ?? '' },
    ];

    if (isLastQuestion) {
      onFinish(updatedAnswers);
    } else {
      setAnswers(updatedAnswers);
      setSelected(null);
      setTimeLeft(SECONDS_PER_QUESTION);
      setCurrentIndex((i) => i + 1);
    }
  }

  function handleOptionClick(option) {
    setSelected(option);
  }

  function handleNextClick() {
    goToNext(selected);
  }

  function handleGiveUpConfirm() {
    setShowGiveUpModal(false);
    onGiveUp();
  }

  function handleGiveUpDeny() {
    setShowGiveUpModal(false);
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
          <div className="quiz-header-meta" aria-live="polite">
            <DifficultyBadge difficulty={currentQuestion.difficulty} points={currentQuestion.points} />
            <span className="quiz-progress">Question {currentIndex + 1} of {questions.length}</span>
          </div>
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

        <div className="quiz-actions">
          <button
              className="next-button"
              onClick={handleNextClick}
              disabled={selected === null}
          >
            {isLastQuestion ? 'Submit Quiz' : 'Next Question'}
          </button>

          <button
              className="give-up-button"
              onClick={() => setShowGiveUpModal(true)}
          >
            Nah, I gave up
          </button>
        </div>

        {showGiveUpModal && (
            <div className="modal-overlay">
              <div className="modal-box">
                <p className="modal-text">
                  Are you sure you want to give up on this quiz? Your progress will be lost.
                </p>
                <div className="modal-actions">
                  <button className="modal-confirm" onClick={handleGiveUpConfirm}>
                    Yes, I want to Give up
                  </button>
                  <button className="modal-deny" onClick={handleGiveUpDeny}>
                    No, I want to retry
                  </button>
                </div>
              </div>
            </div>
        )}
      </div>
  );
}
