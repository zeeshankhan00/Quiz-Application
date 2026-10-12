import { useState } from 'react';
import DifficultyBadge from './DifficultyBadge.jsx';

export default function Result({ quiz, result, onRestart }) {
    const [showReview, setShowReview] = useState(false);
    const { score, maxScore, percentage, accuracy, totalQuestions, correctCount,
        incorrectCount, unansweredCount, questionResults } = result;

    let message = 'Keep practicing!';
    if (percentage >= 80) message = 'Excellent work!';
    else if (percentage >= 50) message = 'Good effort!';

    const hasReviewData = Array.isArray(questionResults) && questionResults.length > 0;

    return (
        <div className="result">
            <h1>Quiz Complete</h1>
            <p className="result-quiz-title">{quiz.title}</p>

            <div className="score-circle">
                <span className="score-number">{score}</span>
                <span className="score-divider">/ {maxScore} points</span>
            </div>

            <p className="result-percent">{percentage}% weighted score</p>
            <p className="result-accuracy">{correctCount} of {totalQuestions} correct · {accuracy}% accuracy</p>
            <dl className="result-breakdown" aria-label="Answer breakdown">
                <div><dt>Correct</dt><dd>{correctCount}</dd></div>
                <div><dt>Incorrect</dt><dd>{incorrectCount}</dd></div>
                <div><dt>Skipped</dt><dd>{unansweredCount}</dd></div>
            </dl>
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
    const status = q.correct ? 'correct' : q.answered ? 'incorrect' : 'skipped';
    const statusLabel = q.correct ? '✓ Correct' : q.answered ? '✗ Incorrect' : 'Skipped';
    const sameAnswer = (a, b) => typeof a === 'string' && typeof b === 'string'
        && a.trim() === b.trim();

    return (
        <div className={`review-card review-card-${status}`}>
            <div className="review-card-header">
                <span className="review-question-number">Q{index + 1}</span>
                <span className={`review-status status-${status}`}>{statusLabel}</span>
            </div>

            <div className="review-question-meta">
                <DifficultyBadge difficulty={q.difficulty} />
                <span className="review-points">{q.pointsAwarded} / {q.maxPoints} points</span>
            </div>

            <p className="review-question-text">{q.question}</p>

            <div className="review-options">
                {options.map((opt) => {
                    const isRight = sameAnswer(opt, q.rightAnswer);
                    const isUserPick = sameAnswer(opt, q.userResponse);

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

            {!q.answered && <p className="review-skipped-note">You didn't answer this question. No points were deducted.</p>}
        </div>
    );
}
