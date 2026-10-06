import { useState } from 'react';

export default function Result({ quiz, score, total, questionResults, onRestart }) {
    const [showReview, setShowReview] = useState(false);
    const percent = total > 0 ? Math.round((score / total) * 100) : 0;

    let message = 'Keep practicing!';
    if (percent >= 80) message = 'Excellent work!';
    else if (percent >= 50) message = 'Good effort!';

    const hasReviewData = Array.isArray(questionResults) && questionResults.length > 0;

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

            <div className="result-actions">
                <button className="restart-button" onClick={onRestart}>
                    Try Another Topic
                </button>

                {hasReviewData && (
                    <button className="review-toggle-button" onClick={() => setShowReview((v) => !v)}>
                        {showReview ? 'Hide Detailed Results' : 'View Detailed Results'}
                    </button>
                )}
            </div>

            {showReview && hasReviewData && (
                <div className="review-list">
                    {questionResults.map((q, idx) => (
                        <QuestionReviewCard key={q.id ?? idx} q={q} index={idx} />
                    ))}
                </div>
            )}
        </div>
    );
}

function QuestionReviewCard({ q, index }) {
    const options = [q.option1, q.option2, q.option3, q.option4].filter(Boolean);

    return (
        <div className={`review-card ${q.correct ? 'review-card-correct' : 'review-card-incorrect'}`}>
            <div className="review-card-header">
                <span className="review-question-number">Q{index + 1}</span>
                <span className={`review-status ${q.correct ? 'status-correct' : 'status-incorrect'}`}>
          {q.correct ? '✓ Correct' : '✗ Incorrect'}
        </span>
            </div>

            <p className="review-question-text">{q.question}</p>

            <div className="review-options">
                {options.map((opt) => {
                    const isRight = opt === q.rightAnswer;
                    const isUserPick = opt === q.userResponse;

                    let optionClass = 'review-option';
                    if (isRight) optionClass += ' review-option-right';
                    else if (isUserPick && !isRight) optionClass += ' review-option-wrong-pick';

                    return (
                        <div key={opt} className={optionClass}>
                            {opt}
                            {isRight && <span className="review-tag">Correct answer</span>}
                            {isUserPick && !isRight && <span className="review-tag">Your answer</span>}
                        </div>
                    );
                })}
            </div>

            {!q.userResponse && <p className="review-skipped-note">You didn't answer this question.</p>}
        </div>
    );
}