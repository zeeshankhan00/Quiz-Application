export default function DifficultyBadge({ difficulty, points }) {
  const level = typeof difficulty === 'string' ? difficulty.trim().toLowerCase() : '';
  const labels = { easy: 'Easy', medium: 'Medium', hard: 'Hard' };
  const label = labels[level] || 'Difficulty unavailable';

  return <span className={`difficulty-badge${labels[level] ? ` difficulty-badge--${level}` : ''}`}>
    {label}
    {Number.isInteger(points) && points > 0 && ` · ${points} ${points === 1 ? 'point' : 'points'}`}
  </span>;
}
